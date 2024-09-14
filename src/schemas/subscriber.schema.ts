import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ default: 'Subscribed', enum: ['Subscribed', 'Unsubscribed'] })
  @IsEnum(['Subscribed', 'Unsubscribed'])
  status: string;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
