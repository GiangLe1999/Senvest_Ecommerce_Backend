import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { AdminVariantsModule } from '../admin-variants/admin-variants.module';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AdminVariantsModule,
  ],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
