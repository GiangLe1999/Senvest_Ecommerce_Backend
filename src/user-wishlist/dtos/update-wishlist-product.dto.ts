import { PriorityEnum } from '../../schemas/user-wishlist.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWishlistProductInput {
  @IsString()
  product_id: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  variant_id: string;

  @IsEnum(PriorityEnum)
  @IsOptional()
  priority?: PriorityEnum;
}

export class UpdateWishlistProductOutput extends CoreOutput {}
