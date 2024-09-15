import { Coupon } from '../../schemas/coupon.schema';
import { CoreOutput } from '../../common/dtos/output.dto';

export class GetCouponsOutput extends CoreOutput {
  coupons?: Coupon[];
}
