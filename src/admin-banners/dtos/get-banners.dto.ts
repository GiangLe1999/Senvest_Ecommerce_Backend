import { CoreOutput } from '../../common/dtos/output.dto';
import { Banner } from '../../schemas/banner.schema';

export class GetBannersOutput extends CoreOutput {
  banners?: Banner[];
}
