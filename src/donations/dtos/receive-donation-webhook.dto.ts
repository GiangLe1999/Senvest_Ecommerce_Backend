import { IsString, IsObject } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class DonationWebhookResponseDto {
  @IsString()
  code: string;

  @IsString()
  desc: string;

  @IsString()
  signature: string;

  @IsObject()
  data: any;
}

export class ReceiveDonationWebhookOutput extends CoreOutput {}
