import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Banner } from '../../schemas/banner.schema';

export class UpdateBannerInput {
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  order?: string;

  @IsOptional()
  @IsString()
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsString()
  line_1_vi?: string;

  @IsOptional()
  @IsString()
  line_1_en?: string;

  @IsOptional()
  @IsString()
  line_2_vi?: string;

  @IsOptional()
  @IsString()
  line_2_en?: string;

  @IsOptional()
  @IsString()
  line_3_vi?: string;

  @IsOptional()
  @IsString()
  line_3_en?: string;

  @IsOptional()
  @IsString()
  button_text_vi?: string;

  @IsOptional()
  @IsString()
  button_text_en?: string;
}

export class UpdateBannerOutput extends CoreOutput {
  banner?: Banner;
}
