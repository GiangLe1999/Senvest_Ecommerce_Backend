import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Type } from 'class-transformer';
import { Coupon } from '../../schemas/coupon.schema';

export class UpdateCouponInput {
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiry_date?: Date;

  @IsString()
  @IsOptional()
  assigned_to_email?: string;

  @IsString()
  @IsOptional()
  discount_type?: string;
}

export class UpdateCouponOutput extends CoreOutput {
  coupon?: Coupon;
}
