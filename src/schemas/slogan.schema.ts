import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsString } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type SloganDocument = HydratedDocument<Slogan>;

@Schema({ timestamps: true })
export class Slogan {
  @Prop({ type: String, required: true })
  @IsString()
  content: { type: string; required: true };

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  @IsEnum(['Active', 'Inactive'])
  status: string;

  @Prop({ type: String, required: true, unique: true })
  @IsString()
  order: { type: string; required: true; unique: true };
}

export const SloganSchema = SchemaFactory.createForClass(Slogan);
