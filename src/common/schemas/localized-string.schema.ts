import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';

@Schema()
export class LocalizedString {
  @Prop({ type: String, required: true })
  @IsString()
  en: string;

  @Prop({ type: String, required: true })
  @IsString()
  vi: string;
}

export const LocalizedStringSchema =
  SchemaFactory.createForClass(LocalizedString);
