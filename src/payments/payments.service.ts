import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import PayOS from '@payos/node';
import { Model, Types } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  StatusEnum,
} from '../schemas/payment.schema';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { generateOrderCode, isValidData } from './utils/check-validate';
import { User, UserDocument } from '../schemas/user.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { UserAddress } from '../schemas/user-address.schema';
import {
  CancelPaymentLinkInput,
  CancelPaymentLinkOutput,
} from './dtos/cancel-payment-link.dto';
import { CoreOutput } from '../common/dtos/output.dto';
import { ReceiveWebhookOutput } from './dtos/receive-webhook.dto';
import { Variant, VariantDocument } from '../schemas/variant.schema';
import { formatCurrencyVND } from './utils/format-currency-vnd';
import { EmailsService } from '../emails/emails.service';
import { formatDate } from './utils/format-date';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYOS') private readonly payOS: PayOS,
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantsModel: Model<VariantDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(UserAddress.name)
    private userAddressesModel: Model<ProductDocument>,
    private configService: ConfigService,
    private pusherService: PusherService,
    private readonly emailsService: EmailsService,
  ) {}

  private getPriceForVariant(variant: VariantDocument): number {
    const now = new Date();

    if (
      variant?.discountedPrice &&
      now >= variant.discountedFrom &&
      now <= variant.discountedTo
    ) {
      return parseFloat(variant?.discountedPrice);
    } else {
      return parseFloat(variant?.price);
    }
  }

  async getPaymentByOrderCode(orderCode: string): Promise<PaymentDocument> {
    return await this.paymentsModel.findOne({ orderCode });
  }

  async createPaymentLink(
    createPaymentLinkInput: CreatePaymentLinkInput & {
      user?: UserDocument;
    },
  ) {
    const { items } = createPaymentLinkInput;
    const newItems = await Promise.all(
      items?.map(async (item) => {
        const product = await this.productsModel
          .findOne({
            _id: item._id,
          })
          .select('name')
          .populate({
            path: 'variants',
            model: 'Variant',
            select:
              'price discountedPrice fragrance stock discountedFrom discountedTo',
          })
          .lean();

        if (!product) {
          throw new NotFoundException({
            ok: false,
            error: 'Product does not exist',
          });
        }

        const variant: any = product?.variants.find(
          (variant) => variant._id.toString() === item.variant_id,
        );

        if (!variant) {
          throw new NotFoundException({
            ok: false,
            error: 'Variant does not exist',
          });
        }

        if (item.quantity > variant?.stock) {
          throw new BadRequestException({
            ok: false,
            error: 'Insufficient stock',
          });
        }

        return {
          name:
            product?.name[createPaymentLinkInput?.locale] +
            ' - ' +
            variant?.fragrance,
          quantity: item.quantity,
          price: this.getPriceForVariant(variant),
        };
      }),
    );

    const user_info = {
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      buyerAddress: '',
    };
    if (createPaymentLinkInput?.user_address) {
      const userAddress: any = await this.userAddressesModel.findById(
        createPaymentLinkInput?.user_address,
      );

      if (!userAddress) {
        throw new NotFoundException({
          ok: false,
          error: 'User address does not exist',
        });
      }

      user_info.buyerAddress = userAddress.address;
      user_info.buyerName = userAddress.name;
      user_info.buyerEmail = createPaymentLinkInput.user.email;
      user_info.buyerPhone = userAddress.phone;
    }

    if (createPaymentLinkInput?.not_user_info) {
      user_info.buyerName = createPaymentLinkInput.not_user_info.name;
      user_info.buyerEmail = createPaymentLinkInput.not_user_info.email;
      user_info.buyerPhone = createPaymentLinkInput.not_user_info.phone;
      user_info.buyerAddress = createPaymentLinkInput.not_user_info.address;
    }

    const doubleCheckAmount = newItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    if (createPaymentLinkInput?.amount !== doubleCheckAmount) {
      throw new BadRequestException({
        ok: false,
        error: 'Amount does not match',
      });
    }

    const orderCode = generateOrderCode();

    const orderBody = {
      orderCode: orderCode,
      amount: doubleCheckAmount,
      description: createPaymentLinkInput?.description,
      cancelUrl: createPaymentLinkInput?.cancelUrl,
      returnUrl: createPaymentLinkInput?.returnUrl,
      items: newItems,
      ...user_info,
    };

    const paymentLinkResponse = await this.payOS.createPaymentLink(orderBody);
    if (paymentLinkResponse?.orderCode) {
      await this.paymentsModel.create({
        orderCode: paymentLinkResponse?.orderCode,
        user: createPaymentLinkInput?.user || null,
        status: StatusEnum.pending,
        amount: doubleCheckAmount,
        items: createPaymentLinkInput?.items,
        ...(createPaymentLinkInput?.user_address && {
          user_address: createPaymentLinkInput?.user_address,
        }),
        ...(createPaymentLinkInput?.not_user_info && {
          not_user_info: { ...createPaymentLinkInput?.not_user_info },
        }),
      });
    }

    return {
      ok: true,
      data: {
        bin: paymentLinkResponse?.bin,
        checkoutUrl: paymentLinkResponse?.checkoutUrl,
        accountNumber: paymentLinkResponse?.accountNumber,
        accountName: paymentLinkResponse?.accountName,
        amount: paymentLinkResponse?.amount,
        description: paymentLinkResponse?.description,
        orderCode: paymentLinkResponse?.orderCode,
        qrCode: paymentLinkResponse?.qrCode,
        paymentLinkId: paymentLinkResponse?.paymentLinkId,
        currency: paymentLinkResponse?.currency,
      },
    };
  }

  async cancelPaymentLink(
    cancelPaymentLinkInput: CancelPaymentLinkInput & {
      user_id: Types.ObjectId;
    },
  ): Promise<CancelPaymentLinkOutput> {
    const payment = await this.paymentsModel.findOneAndUpdate(
      {
        orderCode: cancelPaymentLinkInput.orderCode,
        status: StatusEnum.pending,
        user: cancelPaymentLinkInput.user_id,
      },
      { status: StatusEnum.cancelled },
    );
    if (!payment) {
      throw new NotFoundException({
        ok: false,
        error: 'Payment does not exist',
      });
    }

    const order = await this.payOS.cancelPaymentLink(
      cancelPaymentLinkInput.order_id,
      cancelPaymentLinkInput.cancellation_reason,
    );
    if (!order) {
      throw new NotFoundException({
        ok: false,
        error: 'Order does not exist',
      });
    }
    return {
      ok: true,
    };
  }

  async confirmWebhook(webhook_url: string): Promise<CoreOutput> {
    await this.payOS.confirmWebhook(webhook_url);
    return { ok: true };
  }

  async receiveWebhook(data: any): Promise<ReceiveWebhookOutput> {
    const payment: any = await this.paymentsModel
      .findOne({
        orderCode: data?.data?.orderCode,
        status: StatusEnum.pending,
      })
      .populate({
        path: 'user_address',
        model: UserAddress.name,
      });

    if (!payment) {
      throw new NotFoundException({
        ok: false,
        error: 'Payment does not exist',
      });
    }

    if (
      isValidData(
        data?.data,
        data?.signature,
        this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
      )
    ) {
      payment.status = StatusEnum.paid;
      payment.transactionDateTime = new Date(data?.data?.transactionDateTime);
      await payment.save();

      const sendEmailItems = [];

      for (const product of payment.items) {
        const dbProduct = await this.productsModel
          .findOne({
            _id: product._id,
          })
          .select('name totalSales totalQuantitySold');

        if (!dbProduct) {
          payment.status = StatusEnum.cancelled;
          await payment.save();

          throw new NotFoundException({
            ok: false,
            error: 'Product does not exist',
          });
        }

        const dbVariant = await this.variantsModel
          .findById(product.variant_id)
          .select(
            'fragrance stock price discountedPrice discountedFrom discountedTo images',
          );

        if (!dbVariant) {
          payment.status = StatusEnum.cancelled;
          await payment.save();
          throw new NotFoundException({
            ok: false,
            error: 'Variant does not exist',
          });
        }

        const dbVariantPrice = this.getPriceForVariant(dbVariant);

        dbProduct.totalSales += dbVariantPrice * product.quantity;
        dbProduct.totalQuantitySold += product.quantity;
        await dbProduct.save();

        const dbVariantStock = parseInt(dbVariant.stock);
        if (dbVariantStock < product.quantity) {
          payment.status = StatusEnum.cancelled;
          await payment.save();
          throw new BadRequestException({
            ok: false,
            error: 'Variant stock is not enough',
          });
        }

        dbVariant.stock = (dbVariantStock - product.quantity).toString();
        await dbVariant.save();

        sendEmailItems.push({
          image: dbVariant.images[0],
          name: dbProduct.name.vi,
          scent: dbVariant.fragrance,
          price: formatCurrencyVND(dbVariantPrice),
          quantity: product.quantity,
          product_total_price: formatCurrencyVND(
            dbVariantPrice * product.quantity,
          ),
        });
      }

      const user_address = {
        email: '',
        name: '',
        address: '',
        city: '',
        province: '',
        zip: '',
        phone: '',
      };

      if (payment?.not_user_info) {
        user_address.email = payment?.not_user_info?.email;
        user_address.name = payment?.not_user_info?.name;
        user_address.address = payment?.not_user_info?.address;
        user_address.city = payment?.not_user_info?.city;
        user_address.province = payment?.not_user_info?.province;
        user_address.zip = payment?.not_user_info?.zip;
        user_address.phone = payment?.not_user_info?.phone;
      }

      if (payment?.user_address) {
        const user = await this.usersModel
          .findOne({
            _id: payment?.user_address?.user,
          })
          .select('email');
        if (!user) {
          payment.status = StatusEnum.cancelled;
          await payment.save();
          throw new NotFoundException({
            ok: false,
            error: 'User does not exist',
          });
        }
        user_address.email = user.email;
        user_address.name = payment?.user_address?.name;
        user_address.address = payment?.user_address?.address;
        user_address.city = payment?.user_address?.city;
        user_address.province = payment?.user_address?.province;
        user_address.zip = payment?.user_address?.zip;
        user_address.phone = payment?.user_address?.phone;
      }

      await this.pusherService.trigger('payment', 'new-payment', {
        name: user_address.name,
        phone: user_address.phone,
        address: user_address.address,
        city: user_address.city,
        image: sendEmailItems[0].image,
        total: formatCurrencyVND(payment.amount),
      });

      await this.emailsService.sendSuccessfulPaymentEmail({
        items: sendEmailItems,
        sub_total: formatCurrencyVND(payment.amount),
        shipping: formatCurrencyVND(0),
        tax: formatCurrencyVND(0),
        total: formatCurrencyVND(payment.amount),
        order_code: payment.orderCode.toString(),
        created_at: formatDate(payment.transactionDateTime),
        ...user_address,
      });

      return { ok: true };
    } else {
      payment.status = StatusEnum.cancelled;
      await payment.save();

      throw new BadRequestException({
        ok: false,
        error: 'The data does not match the signature',
      });
    }
  }
}
