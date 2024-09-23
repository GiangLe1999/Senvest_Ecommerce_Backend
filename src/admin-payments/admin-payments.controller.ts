import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { AdminPaymentsService } from './admin-payments.service';
import { Response } from 'express';
import { AdminStatusEnum } from '../schemas/payment.schema';

@Controller('admins/admin-payments')
export class AdminPaymentsController {
  constructor(private readonly adminPaymentsService: AdminPaymentsService) {}

  @Get()
  async getOrders(@Res() res: Response) {
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

  @Put(':_id')
  async updatePaymentStatus(
    @Res() res: Response,
    @Param('_id') _id: string,
    @Body() body: { status: AdminStatusEnum },
  ) {
    try {
      return res.status(HttpStatus.OK).json(
        await this.adminPaymentsService.updateProcessingStatus({
          payment_id: _id,
          status: body.status,
        }),
      );
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
