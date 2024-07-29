import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ type: String, required: true })
  @IsString()
  name: { type: string; required: true };

  @Prop({ type: String, required: true })
  @IsString()
  image: { type: string; required: true };

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  @IsEnum(['Active', 'Inactive'])
  status: string;

  @Prop({ type: String, required: true, unique: true })
  @IsString()
  order: { type: string; required: true; unique: true };
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
