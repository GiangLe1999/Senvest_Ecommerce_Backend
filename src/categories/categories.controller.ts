import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Response } from 'express';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.categoriesService.getCategories());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
