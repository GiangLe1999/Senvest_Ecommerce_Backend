import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import {
  UserWishlist,
  UserWishlistSchema,
} from '../schemas/user-wishlist.schema';
import { UserAddress, UserAddressSchema } from '../schemas/user-address.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserWishlist.name, schema: UserWishlistSchema },
      { name: UserAddress.name, schema: UserAddressSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [AdminUsersService],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
