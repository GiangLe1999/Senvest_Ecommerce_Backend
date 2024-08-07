import { PickType } from '@nestjs/mapped-types';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Verification } from '../../schemas/verification.schema';

export class UserVerifyAccountInput extends PickType(Verification, [
  'otp',
  'email',
]) {}

export class UserVerifyAccountOutput extends CoreOutput {}
