import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Slogan } from '../../schemas/slogan.schema';

export class CreateSloganInput {
  @IsString()
  content: string;

  @IsString()
  status: 'Active' | 'Inactive';

  @IsString()
  order: string;
}

export class CreateSloganOutput extends CoreOutput {
  slogan?: Slogan;
}
