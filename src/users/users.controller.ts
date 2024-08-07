import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterInput } from './dtos/user-register.dto';
import { Response } from 'express';
import { UserLoginInput } from './dtos/user-login.dto';
import { AuthUser } from '../auth/user/auth-user.decorator';
import { UserDocument } from '../schemas/user.schema';
import { UserGoogleLoginInput } from './dtos/user-google-login.dto';
import { UserVerifyAccountInput } from './dtos/user-verify-account.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async userRegister(
    @Body() userRegisterInput: UserRegisterInput,
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.usersService.userRegister(userRegisterInput));
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

  @Post('verify')
  async userVerifyAccount(
    @Body() userVerifyAccountInput: UserVerifyAccountInput,
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(
          await this.usersService.userVerifyAccount(userVerifyAccountInput),
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

  @Post('resend-otp')
  async userResendOtp(
    @Body() userResendOtpInput: { email: string },
    @Res() res: Response,
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.usersService.userResendOtp(userResendOtpInput));
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

  @Post('login')
  async userLogin(
    @Body() userLoginInput: UserLoginInput,
    @Res() res: Response,
  ) {
    try {
      res.json(await this.usersService.userLogin(userLoginInput));
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

  @Post('google-login')
  async userGoogleLogin(
    @Body() userGoogleLoginInput: UserGoogleLoginInput,
    @Res() res: Response,
  ) {
    try {
      res.json(await this.usersService.userGoogleLogin(userGoogleLoginInput));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }

  @Post('refresh-token')
  async userRefreshToken(@Res() res: Response, @AuthUser() user: UserDocument) {
    try {
      res.json(await this.usersService.userRefreshToken(user._id.toString()));
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
}
