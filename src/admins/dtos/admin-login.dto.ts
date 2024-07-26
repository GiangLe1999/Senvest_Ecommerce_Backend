import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class AdminLoginInput {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class AdminLoginOutput extends CoreOutput {
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;

  admin?: any;
}
