import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './auth.constants';
import { AuthModuleOptions } from './auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as OTPAuth from 'otpauth';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: AuthModuleOptions,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccessToken(_id: string): Promise<string> {
    return await this.jwtService.signAsync(
      { _id },
      { expiresIn: '1h', secret: this.options.accessTokenKey },
    );
  }

  async createRefreshToken(_id: string): Promise<string> {
    return await this.jwtService.signAsync(
      { _id },
      { expiresIn: '7d', secret: this.options.secretTokenKey },
    );
  }

  async createResetPasswordToken(email: string): Promise<string> {
    return await this.jwtService.signAsync(
      { email },
      { expiresIn: '1h', secret: this.options.resetPasswordTokenKey },
    );
  }

  async provideToken(
    _id: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const accessToken = await this.createAccessToken(_id);
    const refreshToken = await this.createRefreshToken(_id);

    return {
      accessToken,
      refreshToken,
      expiresIn: new Date().setTime(
        new Date().getTime() +
          Number(this.config.get('ACCESS_TOKEN_EXPIRES_IN')),
      ),
    };
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token, {
        secret: this.options.accessTokenKey,
      });
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token, {
        secret: this.options.secretTokenKey,
      });
    } catch (error) {
      return null;
    }
  }

  async verifyResetPasswordToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verify(token, {
        secret: this.options.resetPasswordTokenKey,
      });
    } catch (error) {
      return null;
    }
  }

  createVerifyOtp(email: string, duration: number = 60): string {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: this.options.appName,
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: duration,
        secret: OTPAuth.Secret.fromBase32(this.options.otpAuthSecret),
      });
      const token = totp.generate();
      return token;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  verifyOtp({
    otp,
    email,
    duration = 60,
  }: {
    otp: string;
    email: string;
    duration?: number;
  }): boolean {
    const totp = new OTPAuth.TOTP({
      issuer: this.options.appName,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: duration,
      secret: OTPAuth.Secret.fromBase32(this.options.otpAuthSecret),
    });
    const isValid = totp.validate({ token: otp });
    if (isValid !== null) {
      return true;
    } else {
      return false;
    }
  }
}
