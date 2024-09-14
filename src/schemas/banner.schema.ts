import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../common/schemas/localized-string.schema';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ type: String, required: true })
  @IsString()
  name: { type: string; required: true };

  @Prop({ type: String, required: true })
  @IsString()
  image: { type: string; required: true };

  @Prop({ type: String, required: true })
  @IsString()
  link: { type: string; required: true };

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  @IsEnum(['Active', 'Inactive'])
  status: string;

  @Prop({ type: String, required: true, unique: true })
  @IsString()
  order: { type: string; required: true; unique: true };

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  line_1: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  line_2: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  line_3: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  button_text: LocalizedString;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
