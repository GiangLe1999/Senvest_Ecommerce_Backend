import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductInput } from './dtos/create-product.dto';
import { Response } from 'express';
import { AdminProductsService } from './admin-products.service';

@Controller('admins/admin-products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('files'))
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductInput: CreateProductInput,
    @Res() res: Response,
  ) {
    try {
      console.log(createProductInput);
      res.status(HttpStatus.CREATED).json(
        await this.adminProductsService.createProduct({
          ...createProductInput,
          images: files,
        }),
      );
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ ok: false, error: error.message });
      }
    }
  }
}
