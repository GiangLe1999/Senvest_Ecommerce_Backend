import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
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

  @Get('all-products')
  async getAllProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getAllProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('related-products')
  async getRelatedProducts(
    @Res() res: Response,
    @Body() body: { _id: string; category_id: string },
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.productsService.getRelatedProducts(body));
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send(error.getResponse());
      }

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
