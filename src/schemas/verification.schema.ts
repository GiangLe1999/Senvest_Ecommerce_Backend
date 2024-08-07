import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type VerificationDocument = HydratedDocument<Verification>;

@Schema()
export class Verification {
  @Prop({ type: String, required: true, unique: true })
  @IsEmail()
  email: string;

  @Prop({ type: String, required: true })
  @IsString()
  otp: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
