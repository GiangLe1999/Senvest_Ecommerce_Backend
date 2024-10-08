import { IsDate, IsNumber, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Coupon } from '../../schemas/coupon.schema';
import { Type } from 'class-transformer';

export class CreateCouponInput {
  @IsString()
  code: string;

  @IsNumber()
  discount_value: number;

  @IsDate()
  @Type(() => Date)
  expiry_date: Date;

  @IsString()
  discount_type: string;

  @IsNumber()
  max_usage_count: number;
}

export class CreateCouponOutput extends CoreOutput {
  coupon?: Coupon;
}
