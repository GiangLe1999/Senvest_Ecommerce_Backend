import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';

export class UpdateProductInput {
  @IsString()
  _id: string;

  @IsOptional()
  name?: {
    en?: string;
    vi?: string;
  };

  @IsOptional()
  description?: {
    en?: string;
    vi?: string;
  };

  @IsOptional()
  category?: string;

  @IsOptional()
  variants?: string[];

  @IsOptional()
  status?: 'Published' | 'Inactive';
}

export class UpdateProductOutput extends CoreOutput {
  product?: Product;
}
