import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { GenderEnum } from 'src/schemas/user.schema';

export class UserUpdateProfileInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  current_password?: string;

  @IsOptional()
  @IsString()
  new_password?: string;

  @IsOptional()
  date_of_birth?: any;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  @IsBoolean()
  receive_offers?: boolean;
}

export class UserUpdateProfileOutput extends CoreOutput {}
