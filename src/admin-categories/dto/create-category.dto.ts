import { IsNotEmpty, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Category } from '../../schemas/category.schema';

export class CreateCategoryInput {
  @IsNotEmpty()
  name: {
    en: string;
    vi: string;
  };

  @IsNotEmpty()
  description: {
    en: string;
    vi: string;
  };

  // Optional: if you want to validate other fields
  @IsString()
  status: 'Published' | 'Iinactive' | 'Scheduled';
}

export class CreateCategoryOutput extends CoreOutput {
  category?: Category;
}
