import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponsModel: Model<CouponDocument>,
  ) {}

  async getCouponByCode(code: string): Promise<CouponDocument> {
    const now = new Date();

    const coupon = await this.couponsModel.findOne({
      code,
      status: 'Active',
      expiry_date: { $gt: now },
      max_usage_count: { $gt: 0 },
    });

    return coupon;
  }

  async getCouponByCodeAndEmail(
    code: string,
    email?: string,
  ): Promise<CouponDocument> {
    const now = new Date();

    const coupons = await this.couponsModel.find({
      code,
      status: 'Active',
      expiry_date: { $gt: now },
      max_usage_count: { $gt: 0 },
    });

    if (coupons.length === 0) {
      return undefined;
    } else if (coupons.length === 1 && !coupons[0]?.assigned_to_email) {
      return coupons[0];
    } else {
      for (const coupon of coupons) {
        if (coupon?.assigned_to_email === email) {
          return coupon;
        }
      }

      return undefined;
    }
  }

  async getCoupon(
    code: string,
    email: string,
  ): Promise<{ ok: boolean; coupon: CouponDocument }> {
    const coupon = await this.getCouponByCodeAndEmail(code, email ? email : '');

    if (!coupon) {
      throw new NotFoundException({
        ok: false,
        error: 'Coupon is not valid',
      });
    }

    return {
      ok: true,
      coupon: coupon,
    };
  }
}
