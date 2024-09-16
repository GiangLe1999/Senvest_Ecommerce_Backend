import { Injectable, NotFoundException } from '@nestjs/common';
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
      .sort({ updatedAt: -1 });

    return { ok: true, payments };
  }

  async getPaymentByOrderCode(orderCode: string) {
    const order = await this.paymentsModel
      .findOne({ orderCode: Number(orderCode) })
      .populate([
        {
          path: 'user',
          model: 'User',
        },
        {
          path: 'user_address',
          model: 'UserAddress',
        },
        {
          path: 'items._id',
          model: 'Product',
          select: 'name description',
        },
        {
          path: 'items.variant_id',
          model: 'Variant',
          select: 'fragrance images price',
        },
      ])
      .lean();

    if (!order) {
      throw new NotFoundException({
        ok: false,
        error: 'Order does not exist',
      });
    }

    return { ok: true, order };
  }
}
