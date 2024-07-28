import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';

export class CreateProductInput {
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

  @IsString()
  category: string;

  @IsString()
  status: 'Published' | 'Inactive' | 'Scheduled';

  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('Invalid JSON format for variants');
      }
    }
    return value;
  })
  variants: any;
}

export class CreateProductOutput extends CoreOutput {
  product?: Product;
}
