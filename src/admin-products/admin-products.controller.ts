import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductInput } from './dtos/create-product.dto';
import { Response } from 'express';
import { AdminProductsService } from './admin-products.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { UpdateProductInput } from './dtos/update-product.dto';

@Controller('admins/admin-products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getProducts(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminProductsService.getProducts());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get(':id')
  @UseGuards(AuthAdminGuard)
  async getProduct(@Res() res: Response, @Param('id') _id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminProductsService.getProduct(_id));
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
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductInput: CreateProductInput,
    @Res() res: Response,
  ) {
    try {
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

  @Put('update')
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async updateCategory(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
    @Body() updateProductInput: UpdateProductInput,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.adminProductsService.updateProduct({
          ...updateProductInput,
          images: files,
        }),
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

  @Delete('delete/:id')
  @UseGuards(AuthAdminGuard)
  async deleteProduct(@Res() res: Response, @Param('id') id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminProductsService.deleteProduct(id));
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
