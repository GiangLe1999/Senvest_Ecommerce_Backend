import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { AdminPaymentsService } from './admin-payments.service';
import { Response } from 'express';

@Controller('admins/admin-payments')
export class AdminPaymentsController {
  constructor(private readonly adminPaymentsService: AdminPaymentsService) {}

  @Get()
  async getTotalReviews(@Res() res: Response) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminPaymentsService.getOrders());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get(':order_id')
  async getOrder(@Res() res: Response, @Param('order_id') order_id: string) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminPaymentsService.getOrderById(order_id));
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
