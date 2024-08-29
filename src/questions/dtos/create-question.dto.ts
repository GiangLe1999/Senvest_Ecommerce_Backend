import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CreateQuestionInput {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  question: string;

  @IsString()
  product: string;
}

export class CreateQuestionOutput extends CoreOutput {}
