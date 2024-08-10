import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema';
import { GetBannersOutput } from './dtos/get-banners.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannersModel: Model<BannerDocument>,
  ) {}

  async getBanners(): Promise<GetBannersOutput> {
    const banners = await this.bannersModel
      .find({ status: 'Active' })
      .select('image link')
      .sort({ order: 1 })
      .lean();
    return {
      ok: true,
      banners,
    };
  }
}
