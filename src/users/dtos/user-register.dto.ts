import { PickType } from '@nestjs/mapped-types';
import { User } from '../../schemas/user.schema';
import { CoreOutput } from '../../common/dtos/output.dto';

export class UserRegisterInput extends PickType(User, [
  'email',
  'name',
  'password',
]) {}

export class UserRegisterOutput extends CoreOutput {
  user?: User;
}
