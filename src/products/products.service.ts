import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetProductsOutput } from '../admin-products/dtos/get-products.dto';
import { Product, ProductDocument } from '../schemas/product.schema';
import { LocalizedString } from '../common/schemas/localized-string.schema';
import { VariantDocument } from '../schemas/variant.schema';

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

  async getNewArrivalsProducts(): Promise<{
    ok: boolean;
    category: {
      name: LocalizedString;
      description: LocalizedString;
      products: Product[];
    };
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const products = await this.productModel
      .find({
        createdAt: { $gte: oneWeekAgo },
      })
      .populate({
        path: 'variants',
        model: 'Variant',
      })
      .sort({ createdAt: -1 })
      .lean();

    return {
      ok: true,
      category: {
        name: { vi: 'Sản phẩm mới', en: 'New Arrivals' },
        description: {
          vi: 'Khám phá những sản phẩm nến thơm mới nhất vừa được nhập về, đa dạng mùi hương độc đáo, mang lại sự thư giãn và sang trọng cho không gian sống của bạn. Đặt hàng ngay để nhận ưu đãi đặc biệt!',
          en: 'Discover our latest collection of scented candles, freshly stocked with unique fragrances to elevate your space with relaxation and luxury. Order now and enjoy exclusive offers!',
        },
        products,
      },
    };
  }

  async getBestSellingProducts(): Promise<{
    ok: boolean;
    category: {
      name: LocalizedString;
      description: LocalizedString;
      products: Product[];
    };
  }> {
    const products = await this.productModel
      .find()
      .populate({
        path: 'variants',
        model: 'Variant',
      })
      .sort({ totalQuantitySold: -1 })
      .lean();

    return {
      ok: true,
      category: {
        name: { vi: 'Sản phẩm bán chạy', en: 'Best Selling' },
        description: {
          vi: 'Khám phá bộ sưu tập nến thơm bán chạy nhất với những mùi hương được yêu thích, mang lại sự thư giãn và ấm cúng cho không gian sống. Chất lượng cao, giá tốt, và phù hợp với mọi phong cách.',
          en: 'Discover our best-selling scented candles, featuring the most beloved fragrances to create a relaxing and cozy atmosphere. High quality, great prices, and perfect for any style.',
        },
        products,
      },
    };
  }

  private isDiscounted(variant: VariantDocument): boolean {
    if (
      !variant?.discountedPrice ||
      !variant?.discountedFrom ||
      !variant?.discountedTo
    ) {
      return false;
    }

    const now = new Date();

    return now >= variant?.discountedFrom && now <= variant?.discountedTo;
  }

  async getSaleProducts(): Promise<{
    ok: boolean;
    category: {
      name: LocalizedString;
      description: LocalizedString;
      products: Product[];
    };
  }> {
    let products = await this.productModel
      .find()
      .populate({
        path: 'variants',
        model: 'Variant',
      })
      .lean();

    products = products.filter((product) => {
      return product.variants.some((variant) =>
        this.isDiscounted(variant as any),
      );
    });

    return {
      ok: true,
      category: {
        name: { vi: 'Sản phẩm khuyến mãi', en: 'The Sale Room' },
        description: {
          vi: 'Tiết kiệm ngay với các ưu đãi hấp dẫn từ bộ sưu tập nến thơm khuyến mãi, đa dạng mùi hương thư giãn, mang lại cảm giác ấm cúng cho không gian sống. Sản phẩm chất lượng, giá tốt nhất.',
          en: 'Save now with exclusive deals on our discounted scented candles, featuring a variety of relaxing fragrances to create a cozy atmosphere. High-quality products at the best prices.',
        },
        products,
      },
    };
  }
}
