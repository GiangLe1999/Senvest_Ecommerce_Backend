import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const enum StatusEnum {
  pending = 'pending',
  paid = 'paid',
  cancelled = 'cancelled',
  refunded = 'refunded',
}

export type DonationDocument = HydratedDocument<Donation>;

@Schema({ timestamps: true })
export class Donation {
  @Prop({ type: Number, required: true })
  orderCode: number;

  @Prop({ required: true })
  status: StatusEnum;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  comment?: string;

  @Prop({ type: Date })
  transactionDateTime?: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
