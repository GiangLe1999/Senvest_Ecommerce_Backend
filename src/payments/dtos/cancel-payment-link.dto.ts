import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CancelPaymentLinkInput {
  @IsString()
  orderCode: string;
}

export class CancelPaymentLinkOutput extends CoreOutput {}
