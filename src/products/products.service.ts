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
      .select('name slug description')
      .limit(10)
      .sort({ createdAt: -1 })
      .populate({
        path: 'variants',
        model: 'Variant',
        select:
          'fragrance price discountedPrice discountedFrom discountedTo images',
      });
    return {
      ok: true,
      products,
    };
  }
}
