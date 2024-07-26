import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, min: 0.5, max: 5 })
  ratings: {
    type: number;
    min: 0.5;
    max: 5;
    required: true;
  };

  @Prop()
  comment: string;

  @Prop({ required: true })
  product: {
    type: ObjectId;
    ref: 'Product';
    required: true;
  };

  @Prop({ required: true })
  user: {
    type: ObjectId;
    ref: 'User';
    required: true;
  };

  @Prop({ default: 'Pending', enum: ['Pending', 'Published'] })
  status: {
    type: string;
    default: 'Pending';
    enum: ['Pending', 'Published'];
  };
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
