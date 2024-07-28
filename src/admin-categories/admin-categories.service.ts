import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/create-category.dto';
import slugify from 'slugify';
// import { GetCategoriesOutput } from 'src/categories/dtos/get-categories.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // async getCategories(): Promise<GetCategoriesOutput> {
  //   try {

  //   } catch (error) {

  //   }
  // }

  async createCategory(
    createCategoryInput: CreateCategoryInput & { image: Express.Multer.File },
  ): Promise<CreateCategoryOutput> {
    try {
      let uploadResult = null;
      if (createCategoryInput.image) {
        uploadResult = await this.cloudinaryService.uploadImage(
          createCategoryInput.image,
        );
      }

      const enSlug = slugify(createCategoryInput.name.en, {
        lower: true,
        trim: true,
        strict: true,
      });
      const viSlug = slugify(createCategoryInput.name.vi, {
        lower: true,
        locale: 'vi',
        trim: true,
        strict: true,
      });

      const newCategory = new this.categoryModel({
        ...createCategoryInput,
        ...(uploadResult && { image: uploadResult.secure_url }),
        slug: {
          en: enSlug,
          vi: viSlug,
        },
      });
      newCategory.save();

      return {
        ok: true,
        category: newCategory,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }
}
