import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum PriorityEnum {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export type UserWishlistDocument = HydratedDocument<UserWishlist>;

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

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, enum: PriorityEnum, default: PriorityEnum.medium })
  priority: PriorityEnum;
}

const ItemSchema = SchemaFactory.createForClass(Item);

@Schema()
export class UserWishlist {
  @Prop({ type: [ItemSchema], default: [] })
  items: Item[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;
}

export const UserWishlistSchema = SchemaFactory.createForClass(UserWishlist);
