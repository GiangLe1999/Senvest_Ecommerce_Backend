import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { AdminContactsService } from './admin-contacts.service';

@Controller('admins/admin-contacts')
export class AdminContactsController {
  constructor(private readonly adminContactsService: AdminContactsService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getContacts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminContactsService.getContacts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
