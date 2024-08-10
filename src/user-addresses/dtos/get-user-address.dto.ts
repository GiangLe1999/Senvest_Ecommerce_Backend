import { Types } from 'mongoose';
import { UserAddress } from '../../schemas/user-address.schema';

export class GetUserAddressInput {
  address_id: string;
  user_id: Types.ObjectId;
}

export class GetUserAddressOutput {
  ok: boolean;
  data: UserAddress;
}
