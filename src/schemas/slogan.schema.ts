import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from 'src/common/schemas/localized-string.schema';

export type SloganDocument = HydratedDocument<Slogan>;

@Schema({ timestamps: true })
export class Slogan {
  @Prop({ type: LocalizedStringSchema, required: true })
  @Type(() => LocalizedString)
  content: LocalizedString;

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  @IsEnum(['Active', 'Inactive'])
  status: string;

  @Prop({ type: String, required: true, unique: true })
  @IsString()
  order: { type: string; required: true; unique: true };
}

export const SloganSchema = SchemaFactory.createForClass(Slogan);
