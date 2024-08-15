import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CancelPaymentLinkInput {
  @IsString()
  orderCode: string;

  @IsString()
  order_id: string;

  @IsString()
  cancellation_reason: string;
}

export class CancelPaymentLinkOutput extends CoreOutput {}
