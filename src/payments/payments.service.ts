import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import PayOS from '@payos/node';
import { Model } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  StatusEnum,
} from '../schemas/payment.schema';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { generateOrderCode } from './utils/check-validate';
import { UserDocument } from '../schemas/user.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { UserAddress } from '../schemas/user-address.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYOS') private readonly payOS: PayOS,
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
    @InjectModel(UserAddress.name)
    private userAddressesModel: Model<ProductDocument>,
    private configService: ConfigService,
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
          throw new NotFoundException({
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
      throw new NotFoundException({
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
}
