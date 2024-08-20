import { CoreOutput } from '../../common/dtos/output.dto';
import { IsNotEmpty, IsObject } from 'class-validator';

export class AddNewProductToWishlistInput {
  @IsObject()
  @IsNotEmpty()
  item: {
    _id: string;
    quantity: number;
    variant_id: string;
  };
}

export class AddNewProductToWishlistOutput extends CoreOutput {}
