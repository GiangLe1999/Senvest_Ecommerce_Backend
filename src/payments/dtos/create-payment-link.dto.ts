import { IsNumber, IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

export class CreatePaymentLinkInput {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  cancelUrl: string;

  @IsString()
  returnUrl: string;

  items: any[];
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
    qrCode?: string;
  };
}
