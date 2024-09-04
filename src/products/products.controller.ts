import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
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

  @Get('slug-mapping')
  async getProductSlugsMapping(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getProductSlugsMapping());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get('new-arrivals')
  async getNewArrivalsProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getNewArrivalsProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get('best-selling')
  async getBestSellingProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getBestSellingProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get('sale-products')
  async getSaleProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getSaleProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get(':slug')
  async getProductBySlug(@Res() res: Response, @Param('slug') slug: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getProductBySlug(slug));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
