import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CreateContactInput {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  payment_id?: string;
}

export class CreateContactOutput extends CoreOutput {}
