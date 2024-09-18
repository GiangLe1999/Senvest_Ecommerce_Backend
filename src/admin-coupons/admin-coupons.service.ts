import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';
import {
  CreateCouponInput,
  CreateCouponOutput,
} from './dtos/create-coupon.dto';
import { GetCouponsOutput } from './dtos/get-coupons.dto';
import {
  UpdateCouponInput,
  UpdateCouponOutput,
} from './dtos/update-coupon.dto';
import { CoreOutput } from '../common/dtos/output.dto';

@Injectable()
export class AdminCouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponsModel: Model<CouponDocument>,
  ) {}

  async findCouponById(_id: string): Promise<CouponDocument> {
    return this.couponsModel.findById(_id).lean();
  }

  async getCoupons(): Promise<GetCouponsOutput> {
    try {
      const coupons = await this.couponsModel.find().lean();

      return {
        ok: true,
        coupons,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Internal server error',
      });
    }
  }

  async createCoupon(
    createCouponInput: CreateCouponInput,
  ): Promise<CreateCouponOutput> {
    try {
      const sameCodeCoupon = await this.couponsModel.findOne({
        code: createCouponInput.code,
      });

      if (sameCodeCoupon) {
        throw new BadRequestException({
          ok: false,
          error: 'Coupon already exists',
        });
      }

      const now = new Date();
      const newCoupon = await this.couponsModel.create({
        ...createCouponInput,
        status: now > createCouponInput.expiry_date ? 'Expired' : 'Active',
      });
      return {
        ok: true,
        coupon: newCoupon,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async updateCoupon(
    updateCouponInput: UpdateCouponInput,
  ): Promise<UpdateCouponOutput> {
    try {
      const oldBanner = await this.findCouponById(updateCouponInput._id);

      if (!oldBanner) {
        throw new NotFoundException({
          ok: false,
          error: 'Coupon does not exist',
        });
      }

      let updateObj;

      if (updateCouponInput?.code) {
        const sameCodeCoupon = await this.couponsModel.findOne({
          order: updateCouponInput?.code,
        });

        if (sameCodeCoupon) {
          throw new BadRequestException({
            ok: false,
            error: 'Coupon already exists',
          });
        }

        updateObj = {
          ...updateObj,
          code: updateCouponInput?.code,
        };
      }

      if (updateCouponInput?.discount_value) {
        updateObj = {
          ...updateObj,
          discount_value: updateCouponInput?.discount_value,
        };
      }

      if (updateCouponInput?.discount_type) {
        updateObj = {
          ...updateObj,
          discount_type: updateCouponInput?.discount_type,
        };
      }

      if (updateCouponInput?.expiry_date) {
        updateObj = {
          ...updateObj,
          expiry_date: updateCouponInput?.expiry_date,
        };

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        if (endOfToday > updateCouponInput.expiry_date) {
          updateObj = {
            ...updateObj,
            status: 'Expired',
          };
        } else {
          updateObj = {
            ...updateObj,
            status: 'Active',
          };
        }
      }

      if (updateCouponInput?.max_usage_count) {
        updateObj = {
          ...updateObj,
          max_usage_count: updateCouponInput?.max_usage_count,
        };
      }

      const newCoupon = await this.couponsModel.findByIdAndUpdate(
        updateCouponInput._id,
        updateObj,
        { new: true },
      );

      return {
        ok: true,
        coupon: newCoupon,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async deleteCoupon(_id: string): Promise<CoreOutput> {
    try {
      const coupon = await this.findCouponById(_id);

      if (!coupon) {
        throw new NotFoundException({
          ok: false,
          error: 'Coupon does not exist',
        });
      }

      await this.couponsModel.findByIdAndDelete(_id);
      return {
        ok: true,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }
}
