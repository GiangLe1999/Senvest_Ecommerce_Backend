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
import { DonationsService } from './donations.service';
import { CreateDonationLinkInput } from './dtos/create-donation-link.dto';
import { Response } from 'express';
import { CancelDonationLinkInput } from './dtos/cancel-donation-link.dto';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

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

  @Post('receive-webhook')
  async receiveWebhook(@Body() data, @Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.donationsService.receiveDonationWebhook(data));
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
