import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CONFIG_OPTIONS } from './auth.constants';
import { JwtService } from '@nestjs/jwt';

export interface AuthModuleOptions {
  accessTokenKey: string;
  secretTokenKey: string;
}

@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        AuthService,
        { provide: CONFIG_OPTIONS, useValue: options },
        JwtService,
      ],
      exports: [AuthService],
    };
  }
}
