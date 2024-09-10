import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class CancelDonationLinkInput {
  @IsString()
  orderCode: string;
}

export class CancelDonationLinkOutput extends CoreOutput {}
