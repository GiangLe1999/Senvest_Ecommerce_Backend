import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../common/schemas/localized-string.schema';

// HydratedDocument<Product> is a Mongoose utility type that combines the document type (Product) with Mongoose's built-in document methods
// and properties (such as save(), toObject(), etc.).
export type ProductDocument = HydratedDocument<Product>;

// The @Schema decorator indicates that this class is a Mongoose schema.
@Schema({ timestamps: true })
export class Product {
  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  name: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true, unique: true })
  @Type(() => LocalizedString)
  slug: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  description: LocalizedString;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Variant' }], default: [] })
  variants: Types.ObjectId[];

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({ default: 0 })
  totalQuantitySold: number;

  @Prop({ default: 'Published', enum: ['Published', 'Inactive'] })
  @IsEnum(['Published', 'Inactive'])
  status: string;
}

// This is the actual Mongoose schema created by calling SchemaFactory.createForClass(Product).
// ProductSchema is used by Mongoose to define the schema for the Product collection in MongoDB.
export const ProductSchema = SchemaFactory.createForClass(Product);
