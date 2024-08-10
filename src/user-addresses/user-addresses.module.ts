import { Module } from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { UserAddressesController } from './user-addresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserAddress,
  UserAddressSchema,
} from 'src/schemas/user-address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
  ],
  providers: [UserAddressesService],
  controllers: [UserAddressesController],
})
export class UserAddressesModule {}
