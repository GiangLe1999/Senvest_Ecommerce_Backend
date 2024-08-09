import { CoreOutput } from '../../common/dtos/output.dto';

export interface SendResetPasswordEmailInput {
  email: string;
  emailLink: string;
  link: string;
}

export interface SendResetPasswordEmailOutput extends CoreOutput {}
