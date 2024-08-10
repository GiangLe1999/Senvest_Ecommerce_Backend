import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAddress,
  UserAddressDocument,
} from '../schemas/user-address.schema';
import {
  CreateUserAddressInput,
  CreateUserAddressOutput,
} from './dtos/create-user-address.dto';
import { CoreOutput } from '../common/dtos/output.dto';

@Injectable()
export class UserAddressesService {
  constructor(
    @InjectModel(UserAddress.name)
    private userAddressesModel: Model<UserAddressDocument>,
  ) {}

  async getUserAddressesByUserID(
    user_id: string,
  ): Promise<UserAddressDocument[]> {
    return this.userAddressesModel.find({ user: user_id });
  }

  async getUserAddresses(
    user_id: Types.ObjectId,
  ): Promise<{ ok: boolean; data: UserAddressDocument[] }> {
    const userAddresses = await this.userAddressesModel.find({ user: user_id });
    return { ok: true, data: userAddresses };
  }

  async createUserAddress(
    createUserAddressInput: CreateUserAddressInput & { user_id: string },
  ): Promise<CreateUserAddressOutput> {
    await this.userAddressesModel.create({
      ...createUserAddressInput,
      user: new Types.ObjectId(createUserAddressInput.user_id),
    });
    return { ok: true };
  }

  async deleteUserAddress(deleteUserAddressInput: {
    address_id: string;
    user_id: Types.ObjectId;
  }): Promise<CoreOutput> {
    await this.userAddressesModel.deleteOne({
      _id: deleteUserAddressInput.address_id,
      user: deleteUserAddressInput.user_id,
    });
    return { ok: true };
  }
}
