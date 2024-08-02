import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SlogansService } from './slogans.service';
import { Response } from 'express';

@Controller('slogans')
export class SlogansController {
  constructor(private readonly slogansService: SlogansService) {}

  @Get()
  async getBanners(@Res() res: Response) {
    try {
      res.status(HttpStatus.OK).json(await this.slogansService.getSlogans());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
