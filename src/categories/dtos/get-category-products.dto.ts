import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../../schemas/category.schema';

export class GetCategoryProductsInput {
  @IsString()
  slug: string;
}

export class GetCategoryProductsOutput extends CoreOutput {
  category?: Category;
}
