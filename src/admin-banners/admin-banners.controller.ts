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
import { AdminBannersService } from './admin-banners.service';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBannerInput } from '../admin-banners/dtos/create-banner.dto';
import { Response } from 'express';
import { UpdateBannerInput } from './dtos/update-banner.dto';

@Controller('admins/admin-banners')
export class AdminBannersController {
  constructor(private readonly adminBannersService: AdminBannersService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getBanners(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminBannersService.getBanners());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('create')
  @UseGuards(AuthAdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createBanner(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() createBannerInput: CreateBannerInput,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.adminBannersService.createBanner({
          ...createBannerInput,
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
  async updateBanner(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() updateBannerInput: UpdateBannerInput,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.adminBannersService.updateBanner({
          ...updateBannerInput,
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
        .json(await this.adminBannersService.deleteBanner(id));
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
