import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponsModel: Model<CouponDocument>,
  ) {}

  async getCoupon(
    code: string,
  ): Promise<{ ok: boolean; coupon: CouponDocument }> {
    const coupon = await this.couponsModel
      .findOne({ code, status: 'Active' })
      .lean();

    return {
      ok: true,
      coupon,
    };
  }
}
