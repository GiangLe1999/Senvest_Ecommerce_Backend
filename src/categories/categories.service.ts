import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { GetCategoriesOutput } from './dtos/get-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getCategories(): Promise<GetCategoriesOutput> {
    try {
      const categories = await this.categoryModel
        .find({ status: 'Published' })
        .lean();

      return {
        ok: true,
        categories,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Internal server error',
      });
    }
  }
}
