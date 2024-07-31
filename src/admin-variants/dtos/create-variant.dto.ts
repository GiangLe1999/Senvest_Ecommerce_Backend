import { Variant } from '../../schemas/variant.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  discountedFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  discountedTo?: Date;
}

export class CreateVariantOutput extends CoreOutput {
  ok: boolean;
  variant?: Variant;
}
