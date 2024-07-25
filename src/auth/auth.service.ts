import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './auth.constants';
import { AuthModuleOptions } from './auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
}
