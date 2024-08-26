import { IsNumber, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CreateReviewInput {
  @IsString()
  product_id: string;

  @IsString()
  variant_id: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment: string;

  @IsString()
  name: string;

  @IsString()
  email: string;
}

export class CreateReviewOutput extends CoreOutput {}
