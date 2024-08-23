import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetProductsOutput } from '../admin-products/dtos/get-products.dto';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getHomepageProducts(): Promise<GetProductsOutput> {
    const products = await this.productModel
      .find()
      .select('name slug description rating')
      .limit(10)
      .sort({ createdAt: -1 })
      .populate({
        path: 'variants',
        model: 'Variant',
        select:
          'fragrance price discountedPrice discountedFrom discountedTo images stock',
      });
    return {
      ok: true,
      products,
    };
  }

  async getProductSlugsMapping(): Promise<{
    ok: boolean;
    productSlugsMapping: { [key: string]: string };
  }> {
    const products = await this.productModel.find().select('slug').lean();

    const data = products.reduce((acc, product) => {
      acc[product.slug.en] = product.slug.vi;
      return acc;
    }, {});

    return {
      ok: true,
      productSlugsMapping: data,
    };
  }

  async getProductBySlug(
    slug: string,
  ): Promise<{ ok: boolean; product: Product }> {
    const product = await this.productModel
      .findOne({
        $or: [{ 'slug.en': slug }, { 'slug.vi': slug }],
      })
      .populate([
        {
          path: 'variants',
          model: 'Variant',
        },
        {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      ])
      .lean();
    return {
      ok: true,
      product,
    };
  }
}
