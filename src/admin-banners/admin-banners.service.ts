import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBannerInput } from './dtos/create-banner.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Banner, BannerDocument } from '../schemas/Banner.schema';
import { Model } from 'mongoose';
import { GetBannersOutput } from './dtos/get-banners.dto';
import { CoreOutput } from '../common/dtos/output.dto';
import {
  UpdateBannerInput,
  UpdateBannerOutput,
} from './dtos/update-banner.dto';

@Injectable()
export class AdminBannersService {
  constructor(
    @InjectModel(Banner.name) private bannersModel: Model<BannerDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findBannerById(_id: string): Promise<BannerDocument> {
    return this.bannersModel.findById(_id);
  }

  async getBanners(): Promise<GetBannersOutput> {
    try {
      const banners = await this.bannersModel.find().lean();

      return {
        ok: true,
        banners,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Internal server error',
      });
    }
  }

  async createBanner(
    createBannerInput: CreateBannerInput & { image: Express.Multer.File },
  ) {
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(
        createBannerInput.image,
      );

      const sameOrderBanner = await this.bannersModel.findOne({
        order: createBannerInput.order,
      });

      if (sameOrderBanner) {
        throw new BadRequestException({
          ok: false,
          error: 'Banner with same order already exists',
        });
      }

      const newBanner = await this.bannersModel.create({
        order: createBannerInput.order,
        name: createBannerInput.name,
        status: createBannerInput.status,
        image: uploadResult.secure_url,
      });
      return {
        ok: true,
        banner: newBanner,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async updateBanner(
    updateBannerInput: UpdateBannerInput & { image: Express.Multer.File },
  ): Promise<UpdateBannerOutput> {
    try {
      const oldBanner = await this.findBannerById(updateBannerInput._id);

      if (!oldBanner) {
        throw new NotFoundException({
          ok: false,
          error: 'Banner does not exist',
        });
      }

      let updateObj;

      if (updateBannerInput?.image) {
        if (oldBanner?.image) {
          await this.cloudinaryService.deleteImage(oldBanner?.image as any);
        }

        const uploadResult = await this.cloudinaryService.uploadImage(
          updateBannerInput.image,
        );

        updateObj = {
          image: uploadResult.secure_url,
        };
      }

      if (updateBannerInput?.name) {
        updateObj = {
          ...updateObj,
          name: updateBannerInput?.name,
        };
      }

      if (updateBannerInput?.order) {
        const sameOrderBanner = await this.bannersModel.findOne({
          order: updateBannerInput?.order,
        });

        if (sameOrderBanner) {
          throw new BadRequestException({
            ok: false,
            error: 'Banner with same order already exists',
          });
        }

        updateObj = {
          ...updateObj,
          order: updateBannerInput?.order,
        };
      }

      if (updateBannerInput?.status) {
        updateObj = {
          ...updateObj,
          status: updateBannerInput?.status,
        };
      }

      const newBanner = await this.bannersModel.findByIdAndUpdate(
        updateBannerInput._id,
        updateObj,
        { new: true },
      );

      return {
        ok: true,
        banner: newBanner,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async deleteBanner(_id: string): Promise<CoreOutput> {
    try {
      const banner = await this.findBannerById(_id);

      if (!banner) {
        throw new NotFoundException({
          ok: false,
          error: 'Banner does not exist',
        });
      }

      if (banner?.image) {
        await this.cloudinaryService.deleteImage(banner.image as any);
      }

      await this.bannersModel.findByIdAndDelete(_id);
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
