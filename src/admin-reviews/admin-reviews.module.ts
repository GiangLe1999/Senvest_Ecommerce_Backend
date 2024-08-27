import { Module } from '@nestjs/common';
import { AdminReviewsService } from './admin-reviews.service';
import { AdminReviewsController } from './admin-reviews.controller';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [AdminReviewsService],
  controllers: [AdminReviewsController],
})
export class AdminReviewsModule {}
