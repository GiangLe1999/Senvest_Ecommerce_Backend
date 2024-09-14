import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { Response } from 'express';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subsribersService: SubscribersService) {}

  @Post()
  async createQuestion(
    @Res() res: Response,
    @Body() createSubsriberInput: { email: string },
  ) {
    try {
      return res
        .status(HttpStatus.CREATED)
        .json(
          await this.subsribersService.createSubsriber(
            createSubsriberInput.email,
          ),
        );
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put()
  async unsubscribe(
    @Res() res: Response,
    @Body() createSubsriberInput: { email: string },
  ) {
    try {
      return res
        .status(HttpStatus.CREATED)
        .json(
          await this.subsribersService.createSubsriber(
            createSubsriberInput.email,
          ),
        );
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
