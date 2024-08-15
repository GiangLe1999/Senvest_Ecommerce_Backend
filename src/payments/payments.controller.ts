import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { CreatePaymentLinkInput } from './dtos/create-payment-link.dto';
import { Response } from 'express';
import { CancelPaymentLinkInput } from './dtos/cancel-payment-link.dto';
import { UserDocument } from '../schemas/user.schema';

@Controller('users/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
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
      } else if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }

  @Put('cancel')
  async cancelOrder(
    @Body() cancelPaymentLinkInput: CancelPaymentLinkInput,
    @AuthUser() user: UserDocument,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.paymentsService.cancelPaymentLink({
          ...cancelPaymentLinkInput,
          user_id: user._id,
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

  @Post('confirm-webhook')
  async confirmWebhook(
    @Body() confirmWebhookInput: { webhook_url: string },
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(
          await this.paymentsService.confirmWebhook(
            confirmWebhookInput.webhook_url,
          ),
        );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('receive-webhook')
  async receiveWebhook(
    @Body() data,
    @Res() res: Response,
    @AuthUser() user: UserDocument,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.paymentsService.receiveWebhook({
          ...data,
          user: user || null,
        }),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send(error.getResponse());
      } else {
        console.log(error);
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }
}
