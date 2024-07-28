import {
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryInput } from './dtos/create-category.dto';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCategoryInput } from './dtos/update-category.dto';

@Controller('admins/admin-categories')
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getCategories(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminCategoriesService.getCategories());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('create')
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() createCategoryInput: CreateCategoryInput,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.adminCategoriesService.createCategory({
          ...createCategoryInput,
          image: file,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('update')
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateCategory(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() updateCategoryInput: UpdateCategoryInput,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.adminCategoriesService.updateCategory({
          ...updateCategoryInput,
          image: file,
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
  async deleteCategory(@Res() res: Response, @Param('id') id: string) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminCategoriesService.deleteCategory(id));
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
