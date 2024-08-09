import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class UserForgotPasswordInput {
  @IsString()
  email: string;

  @IsString()
  locale: string;
}

export class UserForgotPasswordOutput extends CoreOutput {}
