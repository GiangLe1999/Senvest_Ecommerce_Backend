import { IsOptional, IsString } from 'class-validator';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Product } from '../../schemas/product.schema';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class UpdateProductInput {
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
  category?: string;

  @IsOptional()
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
  variants?: any;

  @IsOptional()
  status?: 'Published' | 'Inactive' | 'Scheduled';
}

export class UpdateProductOutput extends CoreOutput {
  product?: Product;
}
