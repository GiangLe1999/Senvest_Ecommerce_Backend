import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import {
  Verification,
  VerificationSchema,
} from '../schemas/verification.schema';
import { UserWishlistModule } from '../user-wishlist/user-wishlist.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
    UserWishlistModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
