import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserWishlistService } from './user-wishlist.service';
import { AuthUserGuard } from '../auth/user/auth-user.guard';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { Response } from 'express';
import { AddNewProductToWishlistInput } from './dtos/add-new-product-to-wishlist.dto';
import { DeleteWishlistProductInput } from './dtos/delete-wishlist-product.dto';
import { UpdateWishlistProductInput } from './dtos/update-wishlist-product.dto';

@Controller('users/user-wishlist')
export class UserWishlistController {
  constructor(private readonly userWishlistService: UserWishlistService) {}

  @Get()
  @UseGuards(AuthUserGuard)
  async getUserWishlist(@AuthUser() user: UserDocument, @Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.userWishlistService.getUserWishlist(user._id));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('add-new')
  @UseGuards(AuthUserGuard)
  async addNewProductToWishlist(
    @Body() addNewProductToWishlistInput: AddNewProductToWishlistInput,
    @Res() res: Response,
    @AuthUser() user: UserDocument,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.userWishlistService.addNewProductToWishlist({
          ...addNewProductToWishlistInput,
          user: user._id,
        }),
      );
    } catch (error) {
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
  @UseGuards(AuthUserGuard)
  async updateUserAddress(
    @Body() updateWishlistProductInput: UpdateWishlistProductInput,
    @Res() res: Response,
    @AuthUser() user: UserDocument,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.userWishlistService.updateWishlistProduct({
          ...updateWishlistProductInput,
          user: user._id,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('delete')
  @UseGuards(AuthUserGuard)
  async deleteUserAddress(
    @Body() deleteWishlishProduct: DeleteWishlistProductInput,
    @Res() res: Response,
    @AuthUser() user: UserDocument,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.userWishlistService.deleteWishlistProduct({
          ...deleteWishlishProduct,
          user: user._id,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
