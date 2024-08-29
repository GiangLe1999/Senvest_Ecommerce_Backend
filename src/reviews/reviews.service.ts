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
  }): Promise<{ ok: boolean; reviews: Review[]; overview: any }> {
    const reviews = await this.reviewsModel
      .find({ product: new Types.ObjectId(product_id), status: 'Published' })
      .populate({
        path: 'variant',
        model: 'Variant',
        select: 'fragrance',
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const overview = await this.reviewsModel.aggregate([
      {
        $match: {
          product: new Types.ObjectId(product_id),
          status: 'Published',
        }, // Filter by product_id
      },
      {
        $group: {
          _id: '$rating', // Group by the 'rating' field
          value: { $sum: 1 }, // Count the number of documents in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          rating: '$_id', // Rename _id field to rating
          value: 1, // Include the value field
        },
      },
      {
        $sort: { rating: -1 }, // Optional: Sort by rating in descending order
      },
    ]);

    return { ok: true, reviews, overview };
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
