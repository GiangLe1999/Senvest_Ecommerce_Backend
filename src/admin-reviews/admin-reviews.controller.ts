import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { AdminReviewsService } from './admin-reviews.service';
import { Response } from 'express';

@Controller('admins/admin-reviews')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get('total-reviews')
  async getTotalReviews(@Res() res: Response) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminReviewsService.getTotalReviews());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('publish-review')
  async publishReview(@Res() res: Response, @Body() body: { _id: string }) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminReviewsService.publishReview(body));
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send(error.getResponse());
      }

      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Delete('delete-review/:_id')
  async deleteReview(@Res() res: Response, @Param('_id') _id: string) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminReviewsService.deleteReview(_id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send(error.getResponse());
      }

      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
