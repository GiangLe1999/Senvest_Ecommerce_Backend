import { IsString, IsObject } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';

export class WebhookResponseDto {
  @IsString()
  code: string;

  @IsString()
  desc: string;

  @IsString()
  signature: string;

  @IsObject()
  data: any;
}

export class ReceiveWebhookOutput extends CoreOutput {}
