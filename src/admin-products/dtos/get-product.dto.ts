import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from 'src/schemas/product.schema';

export class GetProductOutput extends CoreOutput {
  product?: Product;
}
