import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../../schemas/category.schema';

export class UpdateCategoryInput {
  @IsString()
  _id: string;

  @IsOptional()
  name?: {
    en?: string;
    vi?: string;
  };

  @IsOptional()
  description?: {
    en?: string;
    vi?: string;
  };

  @IsOptional()
  status?: 'Published' | 'Inactive' | 'Scheduled';
}

export class UpdateCategoryOutput extends CoreOutput {
  category?: Category;
}
