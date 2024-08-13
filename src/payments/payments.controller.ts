import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthUser } from 'src/auth/user/auth-user.decorator';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { Response } from 'express';

@Controller('payments')
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
          user_id: user._id || null,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
