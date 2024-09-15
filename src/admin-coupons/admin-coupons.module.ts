import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../schemas/coupon.schema';
import { AdminCouponsService } from './admin-coupons.service';
import { AdminCouponsController } from './admin-coupons.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  providers: [AdminCouponsService],
  controllers: [AdminCouponsController],
})
export class AdminCouponsModule {}
