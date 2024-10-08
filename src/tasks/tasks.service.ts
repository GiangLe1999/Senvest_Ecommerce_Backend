import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Coupon,
  CouponDocument,
  CouponStatusEnum,
} from '../schemas/coupon.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Coupon.name) private couponsModel: Model<CouponDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private readonly emailsService: EmailsService,
    private config: ConfigService,
  ) {}

  async createBirthdayCoupons() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const day = today.getDate();
    const month = today.getMonth() + 1;

    // Create birthday coupons
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`;

    const users = await this.usersModel.aggregate([
      {
        $addFields: {
          birthMonth: { $month: '$date_of_birth' },
          birthDay: { $dayOfMonth: '$date_of_birth' },
        },
      },
      {
        $match: {
          birthMonth: month,
          birthDay: day,
        },
      },
    ]);

    if (!users || users.length === 0) {
      return;
    }

    for (const user of users) {
      const couponCode = `BIRTHDAY${formattedDate}`;

      const expiryDate = new Date();
      expiryDate.setHours(23, 59, 59, 999);

      const existingCoupon = await this.couponsModel.findOne({
        code: couponCode,
        assigned_to_email: user.email,
      });

      if (existingCoupon) {
        continue;
      }

      await this.couponsModel.create({
        code: couponCode,
        discount_value: 10,
        max_usage_count: 1,
        assigned_to_email: user.email,
        expiry_date: expiryDate,
      });

      await this.emailsService.sendBirthdayCouponEmail({
        email: user.email,
        coupon: couponCode,
        date: formattedDate,
      });
    }

    // Update coupon status
    const expiredCoupons = await this.couponsModel.find({
      expiry_date: { $lt: today },
      status: { $in: [CouponStatusEnum.active, CouponStatusEnum.used] },
    });

    if (!expiredCoupons.length) {
      console.log('No expired coupons found.');
      return;
    }

    // Update the status of each expired coupon
    for (const coupon of expiredCoupons) {
      await this.couponsModel.updateOne(
        { _id: coupon._id },
        { $set: { status: CouponStatusEnum.expired } },
      );
      console.log(`Coupon ${coupon.code} marked as expired.`);
    }

    return {
      ok: true,
    };
  }
}
