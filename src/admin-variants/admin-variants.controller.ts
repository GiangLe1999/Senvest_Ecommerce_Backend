import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminVariantsService } from './admin-variants.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CreateVariantInput } from './dtos/create-variant.dto';
import { UpdateVariantInput } from './dtos/update-variant.dto';

@Controller('admins/admin-variants')
export class AdminVariantsController {
  constructor(private readonly adminVariantsService: AdminVariantsService) {}

  @Post('create')
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createVariant(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createVariantInput: CreateVariantInput,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.adminVariantsService.createVariant({
          ...createVariantInput,
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
  // @UseGuards(AuthAdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async updateVariant(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
    @Body() updateVariantInput: UpdateVariantInput,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.adminVariantsService.updateVariant({
          ...updateVariantInput,
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
}
