import {
  DeleteWishlistProductInput,
  DeleteWishlistProductOutput,
} from './dtos/delete-wishlist-product.dto';
import { UpdateWishlistProductInput } from './dtos/update-wishlist-product.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserWishlist,
  UserWishlistDocument,
} from '../schemas/user-wishlist.schema';
import {
  AddNewProductToWishlistInput,
  AddNewProductToWishlistOutput,
} from './dtos/add-new-product-to-wishlist.dto';
import { GetUserWishlistOutput } from './dtos/get-user-wishlist.dto';

@Injectable()
export class UserWishlistService {
  constructor(
    @InjectModel(UserWishlist.name)
    private userWishlistModel: Model<UserWishlistDocument>,
  ) {}

  async getUserWishlist(user: Types.ObjectId): Promise<GetUserWishlistOutput> {
    const wishlist = await this.userWishlistModel.findOne({
      user,
    });

    return { ok: true, wishlist };
  }

  async createUserWishlist(user: Types.ObjectId) {
    await this.userWishlistModel.create({ user });
    return { ok: true };
  }

  async addNewProductToWishlist(
    addNewProductToWishlistInput: AddNewProductToWishlistInput & {
      user: Types.ObjectId;
    },
  ): Promise<AddNewProductToWishlistOutput> {
    const { item } = addNewProductToWishlistInput;

    const wishlist = await this.userWishlistModel.findOne({
      user: addNewProductToWishlistInput.user,
    });

    if (
      wishlist.items.some(
        (i) =>
          i._id.toString() === item._id.toString() &&
          i.variant_id.toString() === item.variant_id.toString(),
      )
    ) {
      throw new BadRequestException({
        ok: false,
        error: 'Sản phẩm đã tồn tại trong danh sách yêu thích',
      });
    }

    await this.userWishlistModel.updateOne(
      { user: addNewProductToWishlistInput.user },
      {
        $push: {
          items: item,
        },
      },
    );

    return { ok: true };
  }

  async updateWishlistProduct(
    updateWishlistProductInput: UpdateWishlistProductInput & {
      user: Types.ObjectId;
    },
  ): Promise<AddNewProductToWishlistOutput> {
    await this.userWishlistModel.updateOne(
      {
        user: updateWishlistProductInput.user,
      },
      {
        $set: {
          'items.$[item].priority': updateWishlistProductInput.priority,
          'items.$[item].quantity': updateWishlistProductInput.quantity,
        },
      },
      {
        arrayFilters: [
          {
            'item._id': updateWishlistProductInput.product_id,
            'item.variant_id': updateWishlistProductInput.variant_id,
          },
        ],
      },
    );

    return { ok: true };
  }

  async deleteWishlistProduct(
    deleteWishlistProductInput: DeleteWishlistProductInput & {
      user: Types.ObjectId;
    },
  ): Promise<DeleteWishlistProductOutput> {
    await this.userWishlistModel.updateOne(
      {
        user: deleteWishlistProductInput.user,
      },
      {
        $pull: {
          items: {
            _id: deleteWishlistProductInput.product_id,
            variant_id: deleteWishlistProductInput.variant_id,
          },
        },
      },
    );

    return { ok: true };
  }
}
