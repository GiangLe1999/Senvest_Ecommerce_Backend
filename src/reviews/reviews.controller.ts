import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Response } from 'express';
import { CreateReviewInput } from './dtos/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':product_id?')
  async getReviews(
    @Res() res: Response,
    @Param('product_id') product_id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      return res.status(HttpStatus.OK).json(
        await this.reviewsService.getProductReviews({
          product_id,
          page,
          limit,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post()
  async createReview(
    @Res() res: Response,
    @Body() createReviewInput: CreateReviewInput,
  ) {
    try {
      return res
        .status(HttpStatus.CREATED)
        .json(await this.reviewsService.createReview(createReviewInput));
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
