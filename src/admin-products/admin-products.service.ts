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
import { CoreOutput } from 'src/common/dtos/output.dto';
import { GetProductOutput } from './dtos/get-product.dto';
import {
  UpdateProductInput,
  UpdateProductOutput,
} from './dtos/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findProductById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id);

    return product;
  }

  async getProducts(): Promise<GetProductsOutput> {
    try {
      const products = await this.productModel.find().populate({
        path: 'category',
        model: 'Category',
        select: 'name image',
      });
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
        .populate({
          path: 'category',
          model: 'Category',
          select: 'name _id',
        })
        .select('-totalSales -totalQuantitySold -slug')
        .lean();

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      const FormattedProductVariants = product.variants.map((variant) => ({
        ...variant,
        price: String(variant.price),
        discountedPrice: String(variant.discountedPrice),
        stock: String(variant.stock),
      }));

      return {
        ok: true,
        product: {
          ...product,
          variants: FormattedProductVariants as any,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async createProduct(
    createProductInput: CreateProductInput & { images: Express.Multer.File[] },
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

      const uploadResult = await this.cloudinaryService.uploadImages(
        createProductInput.images,
      );

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

      const newProduct = new this.productModel({
        ...createProductInput,
        ...(uploadResult && {
          images: uploadResult.map((image) => image.secure_url),
        }),
        category: categoryObjectId,
        slug: {
          en: enSlug,
          vi: viSlug,
        },
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
    updateProductInput: UpdateProductInput & { images: Express.Multer.File[] },
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

      if (updateProductInput?.images?.length) {
        if ((product?.images as any)?.length) {
          await this.cloudinaryService.deleteImages(product.images as any);
        }

        const uploadResult = await this.cloudinaryService.uploadImages(
          updateProductInput.images,
        );
        updateObj = {
          images: uploadResult.map((image) => image.secure_url),
        };
      }

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
        updateObj = {
          ...updateObj,
          category: updateProductInput?.category || product.category._id,
        };
      }

      if (updateProductInput?.variants) {
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

  async deleteProduct(_id: string): Promise<CoreOutput> {
    try {
      const product = await this.findProductById(_id);

      if (!product) {
        throw new NotFoundException({
          ok: false,
          error: 'Product does not exist',
        });
      }

      await this.cloudinaryService.deleteImages(product.images as any);

      const category = await this.categoryModel.findById(product.category);
      if (category) {
        category.products = category.products.filter(
          (product) => product.toString() !== _id,
        );
        await category.save();
      }

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
