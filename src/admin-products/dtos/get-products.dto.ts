import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';

export class GetProductsOutput extends CoreOutput {
  products?: Product[];
}
