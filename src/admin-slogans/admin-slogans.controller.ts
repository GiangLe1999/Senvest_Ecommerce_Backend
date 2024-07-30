import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminSlogansService } from './admin-slogans.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { Response } from 'express';
import { CreateSloganInput } from './dtos/create-slogan.dto';
import { UpdateSloganInput } from './dtos/update-slogan.dto';

@Controller('admins/admin-slogans')
export class AdminSlogansController {
  constructor(private readonly adminSlogansService: AdminSlogansService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getBanners(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminSlogansService.getSlogans());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('create')
  @UseGuards(AuthAdminGuard)
  async createSlogan(
    @Res() res: Response,
    @Body() createSloganInput: CreateSloganInput,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.adminSlogansService.createSlogan(createSloganInput));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('update')
  @UseGuards(AuthAdminGuard)
  async updateSlogan(
    @Res() res: Response,
    @Body() updateSloganInput: UpdateSloganInput,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.adminSlogansService.updateSlogan(updateSloganInput));
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

  @Delete('delete/:id')
  @UseGuards(AuthAdminGuard)
  async deleteSlogan(@Res() res: Response, @Param('id') id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminSlogansService.deleteSlogan(id));
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
