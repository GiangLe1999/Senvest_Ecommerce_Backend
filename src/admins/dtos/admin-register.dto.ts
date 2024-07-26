import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class AdminRegisterInput {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class AdminRegisterOutput extends CoreOutput {}
