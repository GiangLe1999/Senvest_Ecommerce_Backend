import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';

export class GetProductOutput extends CoreOutput {
  product?: Product;
}
