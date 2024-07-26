import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryInput } from './dto/create-category.dto';
import { AuthAdminGuard } from 'src/auth/admin/auth-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admins/admin-categories')
export class AdminCategoriesController {
  constructor(
    private readonly adminCategoriesService: AdminCategoriesService,
  ) {}

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
      console.log(error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
