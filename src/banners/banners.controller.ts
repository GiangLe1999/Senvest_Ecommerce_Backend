import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { BannersService } from './banners.service';
import { Response } from 'express';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async getBanners(@Res() res: Response) {
    try {
      res.status(HttpStatus.OK).json(await this.bannersService.getBanners());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
