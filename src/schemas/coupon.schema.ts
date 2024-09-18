import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const enum CouponStatusEnum {
  active = 'Active',
  expired = 'Expired',
  used = 'Used',
}

export const enum DiscountTypeEnum {
  percent = 'Percent',
  value = 'Value',
}

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({
    enum: ['Active', 'Expired', 'Used'],
    default: CouponStatusEnum.active,
  })
  status: CouponStatusEnum;

  @Prop({ type: Number, required: true })
  discount_value: number;

  @Prop({
    enum: ['Percent', 'Value'],
    default: DiscountTypeEnum.percent,
  })
  discount_type: DiscountTypeEnum;

  @Prop({ type: Date, required: true })
  expiry_date: Date;

  @Prop({ type: Number, default: 0 })
  usage_count: number;

  @Prop({ type: Number, default: 100 })
  max_usage_count: number;

  @Prop({ type: String })
  assigned_to_user?: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
