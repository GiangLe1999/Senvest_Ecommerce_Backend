import { Injectable, NotFoundException } from '@nestjs/common';
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
import {
  GetUserAddressInput,
  GetUserAddressOutput,
} from './dtos/get-user-address.dto';
import {
  UpdateUserAddressInput,
  UpdateUserAddressOutput,
} from './dtos/update-user-address.dto';

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

  async getUserAddress(
    getUserAddressInput: GetUserAddressInput,
  ): Promise<GetUserAddressOutput> {
    const address = await this.userAddressesModel.findOne({
      _id: getUserAddressInput.address_id,
      user: getUserAddressInput.user_id,
    });

    if (!address) {
      throw new NotFoundException({
        ok: false,
        error: 'Address not found',
      });
    }

    return { ok: true, data: address };
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

  async updateUserAddress(
    updateUserAddressInput: UpdateUserAddressInput & {
      user_id: Types.ObjectId;
    },
  ): Promise<UpdateUserAddressOutput> {
    await this.userAddressesModel.updateOne(
      { _id: updateUserAddressInput._id, user: updateUserAddressInput.user_id },
      { ...updateUserAddressInput },
    );
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
