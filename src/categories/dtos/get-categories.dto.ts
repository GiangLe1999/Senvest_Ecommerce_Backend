import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../../schemas/category.schema';

export class GetCategoriesOutput extends CoreOutput {
  categories?: Category[];
}
