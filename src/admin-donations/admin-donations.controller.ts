import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AdminDonationsService } from './admin-donations.service';
import { Response } from 'express';

@Controller('admins/admin-donations')
export class AdminDonationsController {
  constructor(private readonly adminDonationsService: AdminDonationsService) {}

  @Get()
  async getDonations(@Res() res: Response) {
    try {
      return res
        .status(HttpStatus.OK)
        .json(await this.adminDonationsService.getDonations());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
