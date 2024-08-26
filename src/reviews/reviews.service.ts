import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import {
  CreateReviewInput,
  CreateReviewOutput,
} from './dtos/create-review.dto';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewsModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
  ) {}

  async getProductReviews({
    product_id,
    page,
    limit,
  }: {
    product_id: string;
    page: number;
    limit: number;
  }): Promise<{ ok: boolean; reviews: Review[] }> {
    const reviews = await this.reviewsModel
      .find({ product: product_id, status: 'Published' })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    return { ok: true, reviews };
  }

  async createReview(
    createReviewInput: CreateReviewInput,
  ): Promise<CreateReviewOutput> {
    const existingComment = await this.reviewsModel.findOne({
      email: createReviewInput.email,
      product: new Types.ObjectId(createReviewInput.product_id),
      variant: new Types.ObjectId(createReviewInput.variant_id),
    });
    if (existingComment) {
      throw new BadRequestException({
        ok: false,
        error: 'You have already reviewed this product',
      });
    }

    await this.reviewsModel.create({
      ...createReviewInput,
      product: new Types.ObjectId(createReviewInput.product_id),
      variant: new Types.ObjectId(createReviewInput.variant_id),
    });
    return { ok: true };
  }
}
