import {
  UserGoogleLoginInput,
  UserGoogleLoginOutput,
} from './dtos/user-google-login.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserLoginInput, UserLoginOutput } from './dtos/user-login.dto';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { UserRefreshTokenOutput } from './dtos/user-refresh-token';
import { User, UserDocument } from '../schemas/user.schema';
import {
  UserRegisterInput,
  UserRegisterOutput,
} from './dtos/user-register.dto';
import { EmailsService } from '../emails/emails.service';
import {
  Verification,
  VerificationDocument,
} from '../schemas/verification.schema';
import {
  UserVerifyAccountInput,
  UserVerifyAccountOutput,
} from './dtos/user-verify-account.dto';
import { CoreOutput } from '../common/dtos/output.dto';
import {
  UserForgotPasswordInput,
  UserForgotPasswordOutput,
} from './dtos/user-forgot-password.dto';
import { ConfigService } from '@nestjs/config';
import {
  UserResetPasswordInput,
  UserResetPasswordOutput,
} from './dtos/user-reset-password.dto';
import {
  UserUpdateProfileInput,
  UserUpdateProfileOutput,
} from './dtos/user-update-profile.dto';
import { UserWishlistService } from '../user-wishlist/user-wishlist.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Verification.name)
    private verificationsModel: Model<VerificationDocument>,
    private readonly authService: AuthService,
    private readonly emailsService: EmailsService,
    private readonly config: ConfigService,
    private readonly userWishlistService: UserWishlistService,
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

    const otp = this.authService.createVerifyOtp(newUser.email);
    await this.verificationsModel.create({
      email: newUser.email,
      otp,
      user: new Types.ObjectId(newUser._id),
    });

    await this.emailsService.sendVerifyEmail({
      to: newUser.email,
      otp,
    });

    await this.userWishlistService.createUserWishlist(newUser._id);

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

  async userVerifyAccount(
    userVerifyAccountInput: UserVerifyAccountInput,
  ): Promise<UserVerifyAccountOutput> {
    const { email, otp } = userVerifyAccountInput;

    const verification = await this.verificationsModel.findOne({
      otp,
      email,
    });

    if (!verification) {
      throw new BadRequestException({
        ok: false,
        error: 'Invalid OTP',
      });
    }

    const user = await this.usersModel.findById(verification.user);

    if (!user) {
      throw new BadRequestException({
        ok: false,
        error: 'User not found',
      });
    }

    user.is_verified = true;
    await user.save();
    await this.verificationsModel.deleteOne({ _id: verification._id });

    return {
      ok: true,
    };
  }

  async userResendOtp({ email }: { email: string }): Promise<CoreOutput> {
    const verification = await this.verificationsModel.findOne({ email });

    if (!verification) {
      throw new BadRequestException({
        ok: false,
        error: 'Not found user',
      });
    }

    const otp = this.authService.createVerifyOtp(email);

    verification.otp = otp;
    await verification.save();

    await this.emailsService.sendVerifyEmail({
      to: email,
      otp,
    });

    return {
      ok: true,
    };
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

  async userForgotPassword(
    forgotPasswordInput: UserForgotPasswordInput,
  ): Promise<UserForgotPasswordOutput> {
    const { email, locale } = forgotPasswordInput;
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new BadRequestException({
        ok: false,
        error: 'User not found',
      });
    }

    if (!user.is_verified) {
      throw new BadRequestException({
        ok: false,
        error: 'User not verified',
      });
    }

    if (!user.password) {
      throw new BadRequestException({
        ok: false,
        error: 'Cannot reset password',
      });
    }

    const resetPasswordToken =
      await this.authService.createResetPasswordToken(email);
    await this.emailsService.sendResetPasswordEmail({
      email,
      emailLink: `mailto:${email}`,
      link: `${this.config.get('APP_FRONTEND_URL')}/${locale}/reset-password/${resetPasswordToken}`,
    });

    return {
      ok: true,
    };
  }

  async userResetPassword(
    resetPasswordInput: UserResetPasswordInput,
  ): Promise<UserResetPasswordOutput> {
    const { password, token } = resetPasswordInput;

    const { email } = await this.authService.verifyResetPasswordToken(token);

    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new BadRequestException({
        ok: false,
        error: 'User not found',
      });
    }

    if (!user.is_verified) {
      throw new BadRequestException({
        ok: false,
        error: 'User not verified',
      });
    }

    if (!user.password) {
      throw new BadRequestException({
        ok: false,
        error: 'Cannot reset password',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      ok: true,
    };
  }

  async userUpdateProfile(
    userUpdateProfileInput: UserUpdateProfileInput & { _id: string },
  ): Promise<UserUpdateProfileOutput> {
    if (!userUpdateProfileInput._id) {
      throw new BadRequestException({
        ok: false,
        error: 'Missing user id',
      });
    }

    const user = await this.usersModel.findById(userUpdateProfileInput._id);
    if (!user) {
      throw new BadRequestException({
        ok: false,
        error: 'User not found',
      });
    }

    if (userUpdateProfileInput.name) {
      user.name = userUpdateProfileInput.name;
    }

    if (userUpdateProfileInput.date_of_birth) {
      user.date_of_birth = userUpdateProfileInput.date_of_birth;
    }

    if (userUpdateProfileInput.gender) {
      user.gender = userUpdateProfileInput.gender;
    }

    if (userUpdateProfileInput.receive_offers) {
      user.receive_offers = userUpdateProfileInput.receive_offers;
    }

    if (userUpdateProfileInput.current_password) {
      const isMatchPassword = await bcrypt.compare(
        userUpdateProfileInput.current_password,
        user.password,
      );
      if (!isMatchPassword) {
        throw new BadRequestException({
          ok: false,
          error: 'Current password is incorrect',
        });
      }

      if (userUpdateProfileInput.new_password) {
        const hashedPassword = await bcrypt.hash(
          userUpdateProfileInput.new_password,
          10,
        );
        user.password = hashedPassword;
      }
    }

    await user.save();
    return {
      ok: true,
    };
  }
}
