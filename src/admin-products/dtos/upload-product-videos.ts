import { IsString } from 'class-validator';

export class UploadProductVideosInput {
  @IsString()
  _id: string;
}
