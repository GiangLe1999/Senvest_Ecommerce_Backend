import { PickType } from '@nestjs/mapped-types';
import { CoreOutput } from '../../common/dtos/output.dto';
import { UserAddress } from '../../schemas/user-address.schema';

export class CreateUserAddressInput extends PickType(UserAddress, [
  'alias',
  'name',
  'address',
  'city',
  'province',
  'zip',
  'phone',
]) {}

export class CreateUserAddressOutput extends CoreOutput {}
