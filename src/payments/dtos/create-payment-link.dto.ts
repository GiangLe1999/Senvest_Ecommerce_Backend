import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CreatePaymentLinkInput {
  @IsString()
  locale: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  cancelUrl: string;

  @IsString()
  returnUrl: string;

  @IsString()
  @IsOptional()
  user_address?: string;

  @IsString()
  @IsOptional()
  coupon_code?: string;

  @IsObject()
  @IsOptional()
  not_user_info?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zip: string;
  };

  @IsArray()
  @IsNotEmpty()
  items: { _id: string; quantity: number; variant_id: string }[];
}

export class CreatePaymentLinkOutput extends CoreOutput {
  data: {
    bin?: string;
    checkoutUrl?: string;
    accountNumber?: string;
    accountName?: string;
    amount?: string;
    description?: string;
    orderCode?: string;
    currency?: string;
    qrCode?: string;
    paymentLinkId?: string;
  };
}
