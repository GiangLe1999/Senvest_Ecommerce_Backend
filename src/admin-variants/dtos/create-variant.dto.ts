import { Variant } from '../../schemas/variant.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsOptional, IsString } from 'class-validator';

export class CreateVariantInput {
  @IsString()
  fragrance: string;

  @IsString()
  stock: string;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  discountedPrice?: string;

  @IsString()
  @IsOptional()
  discountedFrom?: string;

  @IsString()
  @IsOptional()
  discountedTo?: string;
}

export class CreateVariantOutput extends CoreOutput {
  ok: boolean;
  variant?: Variant;
}
