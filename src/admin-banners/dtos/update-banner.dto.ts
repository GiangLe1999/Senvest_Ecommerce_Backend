import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Banner } from '../../schemas/Banner.schema';

export class UpdateBannerInput {
  @IsString()
  _id: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  order?: string;

  @IsOptional()
  status?: 'Active' | 'Inactive';
}

export class UpdateBannerOutput extends CoreOutput {
  banner?: Banner;
}
