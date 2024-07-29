import { CoreOutput } from '../../common/dtos/output.dto';
import { Banner } from '../../schemas/Banner.schema';

export class GetBannersOutput extends CoreOutput {
  banners?: Banner[];
}
