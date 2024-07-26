import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../common/schemas/localized-string.schema';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  name: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  slug: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  description: LocalizedString;

  @Prop({ type: String })
  @IsOptional()
  image: string;

  @Prop({ default: 'Published', enum: ['Published', 'Scheduled', 'Inactive'] })
  @IsEnum(['Published', 'Scheduled', 'Inactive'])
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  products: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
