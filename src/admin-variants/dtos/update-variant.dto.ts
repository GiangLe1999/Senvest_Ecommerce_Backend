import { Variant } from '../../schemas/variant.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVariantInput {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional()
  fragrance?: string;

  @IsString()
  @IsOptional()
  stock?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  discountedPrice?: string;

  @IsOptional()
  discountedFrom?: string;

  @IsOptional()
  discountedTo?: string;
}

export class UpdateVariantOutput extends CoreOutput {
  ok: boolean;
  variant?: Variant;
}
