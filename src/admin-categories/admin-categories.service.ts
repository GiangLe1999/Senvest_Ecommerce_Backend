import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/create-category.dto';
import slugify from 'slugify';
import { GetCategoriesOutput } from './dtos/get-categories.dto';
import { UpdateCategoryInput } from './dtos/update-category.dto';
import { CoreOutput } from '../common/dtos/output.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findCategoryById(_id: string): Promise<CategoryDocument> {
    return this.categoryModel.findById(_id);
  }

  async getCategories(): Promise<GetCategoriesOutput> {
    try {
      const categories = await this.categoryModel
        .find()
        .populate({
          path: 'products',
          model: 'Product',
          select: 'totalSales',
        })
        .select('name description image products status')
        .lean()
        .exec();

      const finalCategories = categories.map((category) => {
        const totalSales = category.products.reduce(
          (total, product) => total + (product as any).totalSales,
          0,
        );

        return {
          ...category,
          totalProducts: category.products.length,
          totalSales,
        };
      });

      return {
        ok: true,
        categories: finalCategories,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Internal server error',
      });
    }
  }

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

  async updateCategory(
    updateCategoryInput: UpdateCategoryInput & { image: Express.Multer.File },
  ): Promise<CreateCategoryOutput> {
    try {
      const oldCategory = await this.findCategoryById(updateCategoryInput._id);

      if (!oldCategory) {
        throw new NotFoundException({
          ok: false,
          error: 'Category does not exist',
        });
      }

      let updateObj;

      if (updateCategoryInput?.image) {
        if (oldCategory?.image) {
          await this.cloudinaryService.deleteImage(
            this.cloudinaryService.extractPublicId(oldCategory.image),
          );
        }

        const uploadResult = await this.cloudinaryService.uploadImage(
          updateCategoryInput.image,
        );

        updateObj = {
          image: uploadResult.secure_url,
        };
      }

      if (updateCategoryInput?.name?.en) {
        updateObj = {
          ...updateObj,
          name: {
            en: updateCategoryInput.name.en,
          },
          slug: {
            en: slugify(updateCategoryInput.name.en, {
              lower: true,
              trim: true,
              strict: true,
            }),
          },
        };
      }

      if (updateCategoryInput?.name?.vi) {
        updateObj = {
          ...updateObj,
          name: {
            ...updateObj?.name,
            vi: updateCategoryInput.name.vi,
          },
          slug: {
            ...updateObj?.slug,
            vi: slugify(updateCategoryInput.name.vi, {
              lower: true,
              locale: 'vi',
              trim: true,
              strict: true,
            }),
          },
        };
      }

      if (updateCategoryInput?.description?.vi) {
        updateObj = {
          ...updateObj,
          description: {
            ...updateObj?.description,
            vi: updateCategoryInput.description.vi,
          },
        };
      }

      if (updateCategoryInput?.description?.en) {
        updateObj = {
          ...updateObj,
          description: {
            ...updateObj?.description,
            en: updateCategoryInput.description.en,
          },
        };
      }

      const newCategory = await this.categoryModel.findByIdAndUpdate(
        updateCategoryInput._id,
        updateObj,
        { new: true },
      );

      return {
        ok: true,
        category: newCategory,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async deleteCategory(_id: string): Promise<CoreOutput> {
    try {
      const category = await this.findCategoryById(_id);

      if (!category) {
        throw new NotFoundException({
          ok: false,
          error: 'Category does not exist',
        });
      }

      if (category?.image) {
        await this.cloudinaryService.deleteImage(
          this.cloudinaryService.extractPublicId(category.image),
        );
      }

      await this.categoryModel.findByIdAndDelete(_id);
      return {
        ok: true,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }
}
