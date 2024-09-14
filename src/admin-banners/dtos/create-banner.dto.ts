import { IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Banner } from '../../schemas/banner.schema';

export class CreateBannerInput {
  @IsString()
  name: string;

  @IsString()
  link: string;

  @IsString()
  status: 'Active' | 'Inactive';

  @IsString()
  order: string;

  @IsString()
  line_1_vi: string;

  @IsString()
  line_1_en: string;

  @IsString()
  line_2_vi: string;

  @IsString()
  line_2_en: string;

  @IsString()
  line_3_vi: string;

  @IsString()
  line_3_en: string;

  @IsString()
  button_text_vi: string;

  @IsString()
  button_text_en: string;
}

export class CreateBannerOutput extends CoreOutput {
  banner?: Banner;
}
