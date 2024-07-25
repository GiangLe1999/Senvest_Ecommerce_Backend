import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../common/dtos/output.dto';

export class AdminRefreshTokenOutput extends CoreOutput {
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;
}
