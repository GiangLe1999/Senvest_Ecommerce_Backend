import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { Response } from 'express';

@Controller('users/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/create')
  async createOrder(
    @Body() createPaymentLinkInput: CreatePaymentLinkInput,
    @AuthUser() user,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.paymentsService.createPaymentLink({
          ...createPaymentLinkInput,
          user: user || null,
        }),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }
}
