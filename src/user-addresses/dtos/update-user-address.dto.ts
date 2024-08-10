import { PartialType, PickType } from '@nestjs/mapped-types';
import { CoreOutput } from '../../common/dtos/output.dto';
import { UserAddress } from '../../schemas/user-address.schema';
import { IsString } from 'class-validator';

export class UpdateUserAddressInput extends PartialType(
  PickType(UserAddress, [
    'alias',
    'name',
    'address',
    'city',
    'province',
    'zip',
    'phone',
  ]),
) {
  @IsString()
  _id: string;
}

export class UpdateUserAddressOutput extends CoreOutput {}
