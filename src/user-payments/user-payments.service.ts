import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class UserPaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
  ) {}

  async getPaymentsByUserId(
    user_id: Types.ObjectId,
  ): Promise<{ ok: true; payments: PaymentDocument[] }> {
    const payments = await this.paymentsModel
      .find({ user: user_id })
      .sort({ createdAt: -1 });

    return { ok: true, payments };
  }
}
