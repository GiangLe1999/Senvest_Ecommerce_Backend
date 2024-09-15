import {
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
import { AdminCouponsService } from './admin-coupons.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { CreateCouponInput } from './dtos/create-coupon.dto';
import { Response } from 'express';
import { UpdateCouponInput } from './dtos/update-coupon.dto';

@Controller('admins/admin-coupons')
export class AdminCouponsController {
  constructor(private readonly adminCouponsService: AdminCouponsService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getCoupons(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminCouponsService.getCoupons());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('create')
  @UseGuards(AuthAdminGuard)
  async createBanner(
    @Res() res: Response,
    @Body() createCouponInput: CreateCouponInput,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.adminCouponsService.createCoupon(createCouponInput));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('update')
  @UseGuards(AuthAdminGuard)
  async updateCoupon(
    @Res() res: Response,
    @Body() updateCouponInput: UpdateCouponInput,
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminCouponsService.updateCoupon(updateCouponInput));
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

  @Delete('delete/:id')
  @UseGuards(AuthAdminGuard)
  async deleteCoupon(@Res() res: Response, @Param('id') id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminCouponsService.deleteCoupon(id));
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
