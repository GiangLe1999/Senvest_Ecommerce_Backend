import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema()
export class Variant {
  @Prop({ type: String, required: true })
  @IsString()
  fragrance: string;

  @Prop({ type: String, default: '0' })
  @IsString()
  stock: string;

  @Prop({ type: String, required: true })
  @IsString()
  price: string;

  @Prop({ type: String })
  @IsOptional()
  discountedPrice?: string;

  @Prop({ type: Date })
  @IsOptional()
  discountedFrom?: Date;

  @Prop({ type: Date })
  @IsOptional()
  discountedTo?: Date;

  @Prop({ type: [String], required: true })
  @IsNumber()
  images: {
    type: string[];
    required: true;
  };
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
