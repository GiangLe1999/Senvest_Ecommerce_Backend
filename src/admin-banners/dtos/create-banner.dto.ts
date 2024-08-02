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
}

export class CreateBannerOutput extends CoreOutput {
  banner?: Banner;
}
