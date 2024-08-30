import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
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
}
