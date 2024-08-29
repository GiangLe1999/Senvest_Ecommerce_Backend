import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String, required: true })
  question: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  product: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
