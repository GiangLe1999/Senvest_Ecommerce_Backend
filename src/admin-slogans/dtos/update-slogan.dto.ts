import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Slogan } from '../../schemas/slogan.schema';

export class UpdateSloganInput {
  @IsString()
  _id: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  order?: string;

  @IsOptional()
  status?: 'Active' | 'Inactive';
}

export class UpdateSloganOutput extends CoreOutput {
  slogan?: Slogan;
}
