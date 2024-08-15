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
import { UserDocument } from '../schemas/user.schema';
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
import { EmailsService } from 'src/emails/emails.service';
import { formatDate } from './utils/format-date';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYOS') private readonly payOS: PayOS,
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantsModel: Model<VariantDocument>,
    @InjectModel(UserAddress.name)
    private userAddressesModel: Model<ProductDocument>,
    private configService: ConfigService,
    private readonly emailsService: EmailsService,
  ) {}

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
            select: 'price discountedPrice fragrance stock',
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
          price:
            variant?.discountedPrice && variant?.discountedPrice != 0
              ? parseFloat(variant?.discountedPrice)
              : parseFloat(variant?.price),
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
    if (
      isValidData(
        data?.data,
        data?.signature,
        this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
      )
    ) {
      const payment = await this.paymentsModel.findOne({
        orderCode: data?.data?.orderCode,
        status: StatusEnum.pending,
      });

      if (!payment) {
        throw new NotFoundException({
          ok: false,
          error: 'Payment does not exist',
        });
      }

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
          throw new NotFoundException({
            ok: false,
            error: 'Product does not exist',
          });
        }

        const dbVariant = await this.variantsModel
          .findById(product.variant_id)
          .select('fragrance stock price discountedPrice images');

        if (!dbVariant) {
          throw new NotFoundException({
            ok: false,
            error: 'Variant does not exist',
          });
        }

        const dbVariantPrice =
          dbVariant?.discountedPrice && dbVariant?.discountedPrice != '0'
            ? parseFloat(dbVariant?.discountedPrice)
            : parseFloat(dbVariant?.price);

        dbProduct.totalSales += dbVariantPrice * product.quantity;
        dbProduct.totalQuantitySold += product.quantity;
        await dbProduct.save();

        const dbVariantStock = parseInt(dbVariant.stock);
        if (dbVariantStock < product.quantity) {
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
        name: '',
        address: '',
        city: '',
        province: '',
        zip: '',
        phone: '',
      };

      if (payment?.not_user_info) {
        user_address.name = payment?.not_user_info?.name;
        user_address.address = payment?.not_user_info?.address;
        user_address.city = payment?.not_user_info?.city;
        user_address.province = payment?.not_user_info?.province;
        user_address.zip = payment?.not_user_info?.zip;
        user_address.phone = payment?.not_user_info?.phone;
      }

      await this.emailsService.sendSuccessfulPaymentEmail({
        email: data?.user?.email || payment?.not_user_info?.email,
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
      throw new BadRequestException({
        ok: false,
        error: 'The data does not match the signature',
      });
    }
  }
}
