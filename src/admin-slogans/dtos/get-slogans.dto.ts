import { Slogan } from '../../schemas/slogan.schema';
import { CoreOutput } from '../../common/dtos/output.dto';

export class GetSlogansOutput extends CoreOutput {
  slogans?: Slogan[];
}
