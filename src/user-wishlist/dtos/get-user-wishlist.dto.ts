import { CoreOutput } from '../../common/dtos/output.dto';
import { UserWishlistDocument } from '../../schemas/user-wishlist.schema';

export class GetUserWishlistOutput extends CoreOutput {
  wishlist: UserWishlistDocument;
}
