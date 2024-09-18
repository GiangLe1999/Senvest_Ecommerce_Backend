import { CoreOutput } from '../../common/dtos/output.dto';

export interface SendBirthdayCouponEmailInput {
  email: string;
  coupon: string;
  date: string;
}

export interface SendBirthdayCouponEmailOutput extends CoreOutput {}
