import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { UserPaymentsService } from './user-payments.service';
import { AuthUserGuard } from '../auth/user/auth-user.guard';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { Response } from 'express';

@Controller('users/user-payments')
export class UserPaymentsController {
  constructor(private readonly userPaymentsService: UserPaymentsService) {}

  @Get()
  @UseGuards(AuthUserGuard)
  async getUserPayments(@AuthUser() user: UserDocument, @Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.userPaymentsService.getPaymentsByUserId(user._id));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
