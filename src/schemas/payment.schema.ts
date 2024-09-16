import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export const enum StatusEnum {
  pending = 'pending',
  paid = 'paid',
  cancelled = 'cancelled',
  refunded = 'refunded',
}

export type PaymentDocument = HydratedDocument<Payment>;

@Schema()
export class Item {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' })
  variant_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema()
export class NotUserInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  zip: string;
}

const NotUserInfoSchema = SchemaFactory.createForClass(NotUserInfo);

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderCode: number;

  @Prop({ required: true })
  status: StatusEnum;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: [ItemSchema], required: true })
  items: Item[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user?: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserAddress' })
  user_address?: mongoose.Schema.Types.ObjectId;

  @Prop({ type: NotUserInfoSchema })
  not_user_info?: NotUserInfo;

  @Prop({ type: Date })
  transactionDateTime?: Date;

  @Prop({ type: String })
  coupon_code?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
