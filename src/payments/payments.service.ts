import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import PayOS from '@payos/node';
import { Model, Types } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  StatusEnum,
} from 'src/schemas/payment.schema';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { generateOrderCode } from './utils/check-validate';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYOS') private readonly payOS: PayOS,
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {}

  async createPaymentLink(
    createPaymentLinkInput: CreatePaymentLinkInput & {
      user_id: Types.ObjectId;
    },
  ) {
    const orderCode = generateOrderCode();

    const orderBody = {
      orderCode: orderCode,
      amount: createPaymentLinkInput?.amount,
      description: createPaymentLinkInput?.description,
      cancelUrl: createPaymentLinkInput?.cancelUrl,
      returnUrl: createPaymentLinkInput?.returnUrl,
    };

    const paymentLinkResponse = await this.payOS.createPaymentLink(orderBody);
    if (paymentLinkResponse?.orderCode) {
      await this.paymentsModel.create({
        orderCode: paymentLinkResponse?.orderCode,
        user: createPaymentLinkInput?.user_id,
        status: StatusEnum.pending,
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
      },
    };
  }
}
