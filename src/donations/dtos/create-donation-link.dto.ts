import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CreateDonationLinkInput {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  cancelUrl: string;

  @IsString()
  returnUrl: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class CreateDonationLinkOutput extends CoreOutput {
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
