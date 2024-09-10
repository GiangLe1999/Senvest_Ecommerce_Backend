import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationLinkInput } from './dtos/create-donation-link.dto';
import { Response } from 'express';
import { CancelDonationLinkInput } from './dtos/cancel-donation-link.dto';

@Controller('users/donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('/:orderCode')
  async getOrder(@Param('orderCode') orderCode: string, @Res() res: Response) {
    try {
      return res.status(HttpStatus.OK).json({
        ok: true,
        data: await this.donationsService.getDonationByOrderCode(orderCode),
      });
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

  @Post('create')
  async createDonation(
    @Body() createDonationLinkInput: CreateDonationLinkInput,
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(
          await this.donationsService.createDonationLink(
            createDonationLinkInput,
          ),
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
    @Body() cancelDonationLinkInput: CancelDonationLinkInput,
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(
          await this.donationsService.cancelDonationLink(
            cancelDonationLinkInput,
          ),
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
}
