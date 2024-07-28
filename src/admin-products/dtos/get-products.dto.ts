import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from 'src/schemas/product.schema';

export class GetProductsOutput extends CoreOutput {
  products?: Product[];
}
