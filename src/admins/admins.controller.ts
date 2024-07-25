import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminsService } from './admins.service';
import { AdminLoginInput } from './dtos/admin-login.dto';
import { AdminRegisterInput } from './dtos/admin-register.dto';
import { AuthAdmin } from '../auth/admin/auth-admin.decorator';
import { AdminDocument } from '../schemas/admin.schema';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('register')
  async adminRegister(
    @Body() adminRegisterInput: AdminRegisterInput,
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.adminsService.adminRegister(adminRegisterInput));
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }

  @Post('login')
  async adminLogin(
    @Body() adminLoginInput: AdminLoginInput,
    @Res() res: Response,
  ) {
    try {
      res.json(await this.adminsService.adminLogin(adminLoginInput));
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }

  @Post('refresh-token')
  @UseGuards(AuthAdminGuard)
  async adminRefreshToken(
    @Res() res: Response,
    @AuthAdmin() admin: AdminDocument,
  ) {
    try {
      res.json(
        await this.adminsService.adminRefreshToken(admin._id.toString()),
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }
}
