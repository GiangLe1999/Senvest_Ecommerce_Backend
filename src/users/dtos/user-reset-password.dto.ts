import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class UserResetPasswordInput {
  @IsString()
  token: string;

  @IsString()
  password: string;
}

export class UserResetPasswordOutput extends CoreOutput {}
