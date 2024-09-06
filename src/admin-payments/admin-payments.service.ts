import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailsService } from '../emails/emails.service';
import { PusherService } from '../pusher/pusher.service';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class AdminPaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    private configService: ConfigService,
    private pusherService: PusherService,
    private readonly emailsService: EmailsService,
  ) {}

  async getOrders() {
    const orders = await this.paymentsModel
      .find()
      .populate({
        path: 'user',
        model: 'User',
        select: 'name email',
      })
      .sort({ createdAt: -1 })
      .lean();

    const statusGroupedResult = await this.paymentsModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // Define all possible status values as an array of strings
    const possibleStatuses = ['pending', 'paid', 'cancelled', 'refunded'];

    // Initialize grouped result with possible status strings
    const groupedResult = possibleStatuses.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Update groupedResult with actual counts from statusGroupedResult
    statusGroupedResult.forEach(({ status, count }) => {
      groupedResult[status] = count;
    });

    // Convert the groupedResult into an array format for the final response
    const statusArray = Object.keys(groupedResult).map((status) => ({
      status,
      count: groupedResult[status],
    }));

    return { ok: true, orders, statusSummary: statusArray };
  }

  async getOrderById(order_id: string) {
    const order = await this.paymentsModel
      .findById(order_id)
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
        },
        {
          path: 'items.variant_id',
          model: 'Variant',
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
