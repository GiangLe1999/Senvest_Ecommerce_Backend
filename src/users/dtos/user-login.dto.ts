import { PickType } from '@nestjs/mapped-types';
import { User } from '../../schemas/user.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserLoginInput extends PickType(User, ['email', 'password']) {}

export class UserLoginOutput extends CoreOutput {
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
