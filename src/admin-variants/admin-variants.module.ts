import { Module } from '@nestjs/common';
import { AdminVariantsController } from './admin-variants.controller';
import { AdminVariantsService } from './admin-variants.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from '../schemas/variant.schema';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  controllers: [AdminVariantsController],
  providers: [AdminVariantsService],
  exports: [AdminVariantsService],
})
export class AdminVariantsModule {}
