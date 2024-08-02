import {
  UserGoogleLoginInput,
  UserGoogleLoginOutput,
} from './dtos/user-google-login.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserLoginInput, UserLoginOutput } from './dtos/user-login.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { UserRefreshTokenOutput } from './dtos/user-refresh-token';
import { User, UserDocument } from '../schemas/user.schema';
import {
  UserRegisterInput,
  UserRegisterOutput,
} from './dtos/user-register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {}

  async findUserById(_id: string): Promise<UserDocument> {
    return this.usersModel.findById(_id);
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    return await this.usersModel
      .findOne({ email })
      .select('-gender -receive_offers -date_of_birth -createdAt -updatedAt');
  }

  async userRegister(
    userRegisterInput: UserRegisterInput,
  ): Promise<UserRegisterOutput> {
    const existingUser = await this.findUserByEmail(userRegisterInput.email);
    if (existingUser) {
      throw new BadRequestException({ ok: false, error: 'User đã tồn tại' });
    }
    const hashedPassword = await bcrypt.hash(userRegisterInput.password, 10);
    const newUser = new this.usersModel({
      ...userRegisterInput,
      password: hashedPassword,
    });
    await newUser.save();

    return { ok: true };
  }

  async userLogin(userLoginInput: UserLoginInput): Promise<UserLoginOutput> {
    const existingUser = await this.findUserByEmail(userLoginInput.email);

    if (!existingUser) {
      throw new BadRequestException({
        ok: false,
        error: 'Not found user',
      });
    }

    const isMatchPassword = await bcrypt.compare(
      userLoginInput.password,
      existingUser.password,
    );

    if (!isMatchPassword) {
      throw new BadRequestException({
        ok: false,
        error: 'Password is not correct',
      });
    }

    const { accessToken, expiresIn, refreshToken } =
      await this.authService.provideToken(existingUser._id.toString());

    const userObj = existingUser.toObject();

    delete userObj.password;

    return {
      ok: true,
      accessToken,
      refreshToken,
      expiresIn,
      user: userObj,
    };
  }

  async userGoogleLogin(
    userGoogleLoginInput: UserGoogleLoginInput,
  ): Promise<UserGoogleLoginOutput> {
    const existingUser = await this.findUserByEmail(userGoogleLoginInput.email);

    if (!existingUser) {
      const newUser = new this.usersModel({
        ...userGoogleLoginInput,
        is_verified: true,
      });

      await newUser.save();

      const { accessToken, expiresIn, refreshToken } =
        await this.authService.provideToken(newUser._id.toString());

      return {
        ok: true,
        accessToken,
        refreshToken,
        expiresIn,
        user: newUser,
      };
    } else {
      const { accessToken, expiresIn, refreshToken } =
        await this.authService.provideToken(existingUser._id.toString());

      return {
        ok: true,
        accessToken,
        refreshToken,
        expiresIn,
        user: existingUser,
      };
    }
  }

  async userRefreshToken(_id: string): Promise<UserRefreshTokenOutput> {
    if (!_id) {
      throw new BadRequestException({
        ok: false,
        error: 'Missing user id',
      });
    }

    const { accessToken, expiresIn, refreshToken } =
      await this.authService.provideToken(_id);
    return {
      ok: true,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
