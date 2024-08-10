import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('homepage')
  // @UseGuards(AuthAdminGuard)
  async getHomepageProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getHomepageProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
