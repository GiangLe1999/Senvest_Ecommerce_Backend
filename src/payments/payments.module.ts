import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PayOSProvider } from './payments.provider';
import { Product, ProductSchema } from '../schemas/product.schema';
import { UserAddress, UserAddressSchema } from '../schemas/user-address.schema';
import { Variant, VariantSchema } from '../schemas/variant.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: UserAddress.name,
        schema: UserAddressSchema,
      },
      {
        name: Variant.name,
        schema: VariantSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayOSProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
