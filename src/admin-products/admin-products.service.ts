import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Category, CategoryDocument } from '../schemas/category.schema';
import slugify from 'slugify';
import { GetProductsOutput } from './dtos/get-products.dto';
import { CoreOutput } from '../common/dtos/output.dto';
import { GetProductOutput } from './dtos/get-product.dto';
import {
  UpdateProductInput,
  UpdateProductOutput,
} from './dtos/update-product.dto';
import { AdminVariantsService } from '../admin-variants/admin-variants.service';
import { UploadProductVideosInput } from './dtos/upload-product-videos';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly adminVariantService: AdminVariantsService,
  ) {}

  async findProductById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);

    return product;
  }

  async getProducts(): Promise<GetProductsOutput> {
    try {
      const products = await this.productModel.find().populate([
        {
          path: 'category',
          model: 'Category',
          select: 'name image',
        },
        {
          path: 'variants',
          model: 'Variant',
          select: 'price stock images',
        },
      ]);
      return {
        ok: true,
        products,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async getProduct(_id: string): Promise<GetProductOutput> {
    try {
      const product = await this.productModel
        .findById(_id)
        .populate([
          {
            path: 'category',
            model: 'Category',
            select: 'name _id',
          },
          {
            path: 'variants',
            model: 'Variant',
          },
        ])
        .select('-totalSales -totalQuantitySold -slug')
        .lean();

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      return {
        ok: true,
        product,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async createProduct(
    createProductInput: CreateProductInput,
  ): Promise<CreateProductOutput> {
    try {
      const category = await this.categoryModel.findById(
        createProductInput.category,
      );

      if (!category) {
        throw new BadRequestException({
          ok: false,
          error: 'Category does not exist',
        });
      }

      const categoryObjectId = new Types.ObjectId(createProductInput.category);

      const enSlug = slugify(createProductInput.name.en, {
        lower: true,
        trim: true,
        strict: true,
      });
      const viSlug = slugify(createProductInput.name.vi, {
        lower: true,
        locale: 'vi',
        trim: true,
        strict: true,
      });

      const variants = createProductInput.variants.map(
        (variant) => new Types.ObjectId(variant),
      );

      const newProduct = new this.productModel({
        ...createProductInput,
        category: categoryObjectId,
        slug: {
          en: enSlug,
          vi: viSlug,
        },
        variants,
      });
      newProduct.save();

      category.products.push(newProduct._id);
      category.save();

      return {
        ok: true,
        product: newProduct,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async updateProduct(
    updateProductInput: UpdateProductInput,
  ): Promise<UpdateProductOutput> {
    try {
      const product = await this.findProductById(updateProductInput._id);
      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      let updateObj;

      if (updateProductInput?.name) {
        updateObj = {
          ...updateObj,
          name: {
            vi: updateProductInput?.name?.vi || product.name.vi,
            en: updateProductInput?.name?.en || product.name.en,
          },
          slug: {
            vi: slugify(updateProductInput?.name?.vi || product.name.vi, {
              lower: true,
              locale: 'vi',
              trim: true,
              strict: true,
            }),
            en: slugify(updateProductInput?.name?.en || product.name.en, {
              lower: true,
              trim: true,
              strict: true,
            }),
          },
        };
      }

      if (updateProductInput?.description) {
        updateObj = {
          ...updateObj,
          description: {
            en: updateProductInput?.description?.en || product.description.en,
            vi: updateProductInput?.description?.vi || product.description.vi,
          },
        };
      }

      if (updateProductInput?.category) {
        const newCategory = await this.categoryModel.findById(
          updateProductInput?.category,
        );

        const oldCategory = await this.categoryModel.findById(product.category);

        if (!newCategory) {
          throw new NotFoundException({
            ok: false,
            error: 'Category does not exist',
          });
        }

        if (!oldCategory) {
          throw new NotFoundException({
            ok: false,
            error: 'Category does not exist',
          });
        }

        oldCategory.products = oldCategory.products.filter(
          (id: any) => id.toString() !== product._id.toString(),
        );
        newCategory.products.push(product._id);
        newCategory.save();
        oldCategory.save();

        updateObj = {
          ...updateObj,
          category: updateProductInput?.category || product.category._id,
        };
      }

      if (updateProductInput?.variants) {
        const oldVariants = product.variants.map((variant) =>
          variant.toString(),
        );
        const newVariants = new Set(updateProductInput.variants);
        const deletedVariants = oldVariants.filter(
          (variant) => !newVariants.has(variant),
        );

        if (deletedVariants?.length) {
          const deletePromises = deletedVariants.map(async (variant) => {
            return this.adminVariantService.deleteVariant(variant);
          });

          await Promise.all(deletePromises);
        }

        updateObj = {
          ...updateObj,
          variants: updateProductInput?.variants || product.variants,
        };
      }

      if (updateProductInput?.status) {
        updateObj = {
          ...updateObj,
          status: updateProductInput?.status || product.status,
        };
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        updateProductInput._id,
        updateObj,
        { new: true },
      );

      return {
        ok: true,
        product: updatedProduct,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async uploadProductVideos(
    uploadProductVideosInput: UploadProductVideosInput & {
      videos: Express.Multer.File[];
    },
  ): Promise<CoreOutput> {
    try {
      const product = await this.findProductById(uploadProductVideosInput._id);

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      const uploadResult = await this.cloudinaryService.uploadVideos(
        uploadProductVideosInput.videos,
      );

      product.videos = uploadResult.map((video) => video.secure_url);
      await product.save();
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

  async updateProductVideos(
    updateProductVideosInput: UploadProductVideosInput & {
      videos: Express.Multer.File[];
    },
  ): Promise<CoreOutput> {
    try {
      const product = await this.findProductById(updateProductVideosInput._id);

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      if (product?.videos.length) {
        await this.cloudinaryService.deleteVideos(product.videos as any);
      }

      if (updateProductVideosInput.videos.length === 0) {
        product.videos = [];
        await product.save();
        return {
          ok: true,
        };
      }

      const uploadResult = await this.cloudinaryService.uploadVideos(
        updateProductVideosInput.videos,
      );

      product.videos = uploadResult.map((video) => video.secure_url);

      await product.save();
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

  async deleteProduct(_id: string): Promise<CoreOutput> {
    try {
      const product = await this.findProductById(_id);

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      const category = await this.categoryModel.findById(product.category);
      if (category) {
        category.products = category.products.filter(
          (product) => product.toString() !== _id,
        );
        await category.save();
      }

      if (product?.videos.length) {
        await this.cloudinaryService.deleteVideos(product.videos as any);
      }

      const deletePromises = product.variants.map(async (variant) => {
        return this.adminVariantService.deleteVariant(variant.toString());
      });
      await Promise.all(deletePromises);

      await this.productModel.findByIdAndDelete(_id);
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
