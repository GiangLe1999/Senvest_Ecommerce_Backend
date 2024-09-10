import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum GenderEnum {
  male = 'male',
  female = 'female',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true })
  @IsEmail()
  email: string;

  @Prop({ enum: GenderEnum, default: GenderEnum.male })
  @IsEnum(GenderEnum)
  gender: string;

  @Prop({ type: String, required: true })
  @IsString()
  name: string;

  @Prop({ type: Date })
  @IsOptional()
  @IsDate()
  date_of_birth?: Date;

  @Prop({ type: Boolean, default: false })
  @IsBoolean()
  receive_offers: boolean;

  @Prop({ type: String })
  @IsOptional()
  @IsString()
  password?: string;

  @Prop({ type: Boolean, default: false })
  is_verified: boolean;

  @Prop({ type: Number, default: 0 })
  orders?: number;

  @Prop({ type: Number, default: 0 })
  total_spent?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
