import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';

export class CreateProductInput {
  @IsNotEmpty()
  name: {
    en: string;
    vi: string;
  };

  @IsNotEmpty()
  description: {
    en: string;
    vi: string;
  };

  @IsString()
  category: string;

  @IsString()
  status: 'Published' | 'Inactive';

  @IsArray()
  variants: string[];
}

export class CreateProductOutput extends CoreOutput {
  product?: Product;
}
