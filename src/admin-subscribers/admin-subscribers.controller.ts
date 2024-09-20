import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AdminSubscribersService } from './admin-subscribers.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';

@Controller('admins/admin-subscribers')
export class AdminSubscribersController {
  constructor(
    private readonly adminSubscribersService: AdminSubscribersService,
  ) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getSubscribers(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminSubscribersService.getSubscribers());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
