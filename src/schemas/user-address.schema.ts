import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type UserAddressDocument = HydratedDocument<UserAddress>;

@Schema({ timestamps: true })
export class UserAddress {
  @Prop({ type: String })
  @IsString()
  @IsOptional()
  alias?: string;

  @Prop({ type: String, required: true })
  @IsString()
  name: string;

  @Prop({ type: String, required: true })
  @IsString()
  address: string;

  @Prop({ type: String, required: true })
  @IsString()
  city: string;

  @Prop({ type: String, required: true })
  @IsString()
  province: string;

  @Prop({ type: String, required: true })
  @IsString()
  zip: string;

  @Prop({ type: String, required: true })
  @IsString()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
