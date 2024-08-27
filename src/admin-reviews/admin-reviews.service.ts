import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';

@Injectable()
export class AdminReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewsModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
  ) {}

  async getTotalReviews() {
    const reviews = await this.reviewsModel.aggregate([
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

    const daysOfWeek = [
      { dayOfWeek: 1, dayName: 'Sunday' },
      { dayOfWeek: 2, dayName: 'Monday' },
      { dayOfWeek: 3, dayName: 'Tuesday' },
      { dayOfWeek: 4, dayName: 'Wednesday' },
      { dayOfWeek: 5, dayName: 'Thursday' },
      { dayOfWeek: 6, dayName: 'Friday' },
      { dayOfWeek: 7, dayName: 'Saturday' },
    ];

    const reviewsByDayOfWeek = await this.reviewsModel.aggregate([
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$createdAt' } }, // Group by day of the week
          value: { $sum: 1 }, // Count the number of reviews for each day
        },
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id.dayOfWeek',
          value: 1,
        },
      },
      {
        $sort: { dayOfWeek: 1 }, // Sort by dayOfWeek in ascending order
      },
      {
        $addFields: { fullWeek: daysOfWeek }, // Embed the full daysOfWeek array
      },
      {
        $unwind: '$fullWeek', // Unwind to process each day
      },
      {
        $addFields: {
          dayOfWeek: '$fullWeek.dayOfWeek',
          dayName: '$fullWeek.dayName',
          value: {
            $cond: {
              if: { $eq: ['$dayOfWeek', '$fullWeek.dayOfWeek'] },
              then: '$value',
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: '$dayOfWeek',
          dayName: { $first: '$dayName' },
          value: { $sum: '$value' },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by dayOfWeek in ascending order
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id',
          dayName: 1,
          value: 1,
        },
      },
    ]);

    const reviewTable = await this.reviewsModel
      .find()
      .select('rating status createdAt name email comment')
      .populate([
        {
          path: 'product',
          model: 'Product',
          select: 'name',
        },
        {
          path: 'variant',
          model: 'Variant',
          select: 'fragrance images',
        },
      ]);

    return { ok: true, reviews, reviewsByDayOfWeek, reviewTable };
  }

  async publishReview({ _id }: { _id: string }) {
    const review = await this.reviewsModel.findById(_id);

    if (!review) {
      throw new BadRequestException({
        ok: false,
        error: 'Review does not exist',
      });
    }

    const product = await this.productsModel.findById(review.product);
    if (!product) {
      throw new BadRequestException({
        ok: false,
        error: 'Product does not exist',
      });
    }

    product.nums_of_reviews += 1;
    product.rating = (
      (parseFloat(product.rating) + review.rating) /
      product.nums_of_reviews
    ).toFixed(2);
    await product.save();

    review.status = 'Published';
    await review.save();
    return { ok: true };
  }

  async deleteReview(_id: string) {
    const review = await this.reviewsModel.findById(_id);
    if (!review) {
      throw new BadRequestException({
        ok: false,
        error: 'Review does not exist',
      });
    }

    if (review.status === 'Published') {
      const product = await this.productsModel.findById(review.product);
      if (!product) {
        throw new BadRequestException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      product.rating = (
        (parseFloat(product.rating) * product.nums_of_reviews - review.rating) /
        (product.nums_of_reviews - 1)
      ).toFixed(2);
      product.nums_of_reviews -= 1;
      await product.save();
    }

    await this.reviewsModel.findByIdAndDelete(_id);

    return { ok: true };
  }
}
