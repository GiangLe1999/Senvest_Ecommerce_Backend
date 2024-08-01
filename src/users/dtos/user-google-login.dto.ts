import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/schemas/user.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserGoogleLoginInput extends PickType(User, ['name', 'email']) {}

export class UserGoogleLoginOutput extends CoreOutput {
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;

  user?: any;
}
