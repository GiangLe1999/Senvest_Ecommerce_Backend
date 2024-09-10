import {
  UserWishlist,
  UserWishlistDocument,
} from './../schemas/user-wishlist.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from '../schemas/payment.schema';
import {
  UserAddress,
  UserAddressDocument,
} from '../schemas/user-address.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(UserWishlist.name)
    private userWishlistModel: Model<UserWishlistDocument>,
    @InjectModel(UserAddress.name)
    private userAddressModel: Model<UserAddressDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<UserAddressDocument>,
  ) {}

  async getAllUsers(): Promise<{ ok: true; users: UserDocument[] }> {
    const users = await this.usersModel.find().select('-password').lean();
    return { ok: true, users };
  }

  async getUserById(_id: string): Promise<{
    ok: true;
    user: any;
    userAddresses: UserAddressDocument[];
    userOrders: any[];
  }> {
    const user = await this.usersModel.findById(_id).select('-password').lean();

    if (!user) {
      throw new NotFoundException({
        ok: false,
        error: 'User not found',
      });
    }

    const userWishlist = await this.userWishlistModel
      .findOne({ user: new Types.ObjectId(_id) })
      .select('items')
      .lean();

    const userAddresses = await this.userAddressModel
      .find({ user: new Types.ObjectId(_id) })
      .lean();

    const userOrders = await this.paymentModel
      .find({ user: new Types.ObjectId(_id) })
      .lean();

    return {
      ok: true,
      user: { ...user, wishlist_items: userWishlist.items.length },
      userAddresses,
      userOrders,
    };
  }
}
