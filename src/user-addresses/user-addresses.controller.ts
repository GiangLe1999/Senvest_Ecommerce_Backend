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
  UseGuards,
} from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { AuthUserGuard } from '../auth/user/auth-user.guard';
import { CreateUserAddressInput } from './dtos/create-user-address.dto';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { Response } from 'express';
import { UpdateUserAddressInput } from './dtos/update-user-address.dto';

@Controller('users/user-addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Get()
  @UseGuards(AuthUserGuard)
  async getUserAddresses(@AuthUser() user: UserDocument, @Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.userAddressesService.getUserAddresses(user._id));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Get(':id')
  @UseGuards(AuthUserGuard)
  async getUserAddress(
    @AuthUser() user: UserDocument,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.OK).json(
        await this.userAddressesService.getUserAddress({
          address_id: id,
          user_id: user._id,
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

  @Post('create')
  @UseGuards(AuthUserGuard)
  async createUserAddress(
    @Body() createUserAddressInput: CreateUserAddressInput,
    @AuthUser() user: UserDocument,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.userAddressesService.createUserAddress({
          ...createUserAddressInput,
          user_id: user._id.toString(),
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Put('update')
  @UseGuards(AuthUserGuard)
  async updateUserAddress(
    @Body() updateUserAddressInput: UpdateUserAddressInput,
    @AuthUser() user: UserDocument,
    @Res() res: Response,
  ) {
    try {
      res.status(HttpStatus.CREATED).json(
        await this.userAddressesService.updateUserAddress({
          ...updateUserAddressInput,
          user_id: user._id,
        }),
      );
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Delete(':id')
  @UseGuards(AuthUserGuard)
  async deleteUserAddress(
    @AuthUser() user: UserDocument,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.userAddressesService.deleteUserAddress({
        address_id: id,
        user_id: user._id,
      });

      if (!result) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ ok: false, error: 'Address not found' });
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
