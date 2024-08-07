import { CoreOutput } from '../../common/dtos/output.dto';

export interface SendVerifyEmailInput {
  otp: string;
  to: string;
}

export interface SendVerifyEmailOutput extends CoreOutput {}
