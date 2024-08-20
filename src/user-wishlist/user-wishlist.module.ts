import { Module } from '@nestjs/common';
import { UserWishlistController } from './user-wishlist.controller';
import { UserWishlistService } from './user-wishlist.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserWishlist,
  UserWishlistSchema,
} from '../schemas/user-wishlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserWishlist.name, schema: UserWishlistSchema },
    ]),
  ],
  controllers: [UserWishlistController],
  providers: [UserWishlistService],
  exports: [UserWishlistService],
})
export class UserWishlistModule {}
