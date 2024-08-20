import { CoreOutput } from '../../common/dtos/output.dto';
import { IsString } from 'class-validator';

export class DeleteWishlistProductInput {
  @IsString()
  product_id: string;

  @IsString()
  variant_id: string;
}

export class DeleteWishlistProductOutput extends CoreOutput {}
