import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from 'src/schemas/category.schema';

export class GetCategoriesOutput extends CoreOutput {
  categories?: Category[];
}
