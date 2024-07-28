import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product.dto';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import slugify from 'slugify';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
    } catch (error) {}
  }
}
