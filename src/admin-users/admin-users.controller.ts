import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { Response } from 'express';

@Controller('admins/admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.adminUsersService.getAllUsers());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get(':_id')
  async getUser(@Res() res: Response, @Param('_id') _id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminUsersService.getUserById(_id));
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
