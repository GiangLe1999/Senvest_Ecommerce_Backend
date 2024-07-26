import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from 'src/common/schemas/localized-string.schema';

@Schema()
export class Variant {
  @Prop({ type: String, required: true })
  @IsString()
  color: string;

  @Prop({ type: Number, default: 0 })
  @IsNumber()
  stock: number;

  @Prop({ type: Number, required: true })
  @IsNumber()
  price: number;

  @Prop({ type: Number })
  @IsOptional()
  discountedPrice?: number;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  name: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  slug: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  description: LocalizedString;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [VariantSchema], required: true })
  @Type(() => Variant)
  variants: Variant[];

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({ default: 0 })
  totalQuantitySold: number;

  @Prop({ default: 'Published', enum: ['Published', 'Scheduled', 'Inactive'] })
  @IsEnum(['Published', 'Scheduled', 'Inactive'])
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
