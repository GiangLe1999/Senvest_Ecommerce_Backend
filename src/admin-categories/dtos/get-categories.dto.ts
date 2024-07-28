import { LocalizedString } from '../../common/schemas/localized-string.schema';
import { CoreOutput } from '../../common/dtos/output.dto';
import { IsOptional } from 'class-validator';

export class Category {
  name: LocalizedString;
  description: LocalizedString;
  @IsOptional()
  image?: string;
  totalProducts: number;
  totalSales: number;
  status: string;
}

export class GetCategoriesOutput extends CoreOutput {
  categories?: Category[];
}
