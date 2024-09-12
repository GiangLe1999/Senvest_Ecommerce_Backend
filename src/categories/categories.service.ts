import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { GetCategoriesOutput } from './dtos/get-categories.dto';
import {
  GetCategoryProductsInput,
  GetCategoryProductsOutput,
} from './dtos/get-category-products.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getCategoryProducts(
    getCategoryProductsInput: GetCategoryProductsInput,
  ): Promise<GetCategoryProductsOutput> {
    const { slug } = getCategoryProductsInput;

    const category = await this.categoryModel
      .findOne({
        $or: [{ 'slug.en': slug }, { 'slug.vi': slug }],
      })
      .select('name description slug')
      .populate({
        path: 'products',
        model: 'Product',
        populate: {
          path: 'variants',
          model: 'Variant',
        },
      })
      .lean();

    return {
      ok: true,
      category,
    };
  }

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

  async getCategoriesForNavigation(): Promise<GetCategoriesOutput> {
    try {
      const categories = await this.categoryModel
        .find({ status: 'Published' })
        .select('name slug')
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
