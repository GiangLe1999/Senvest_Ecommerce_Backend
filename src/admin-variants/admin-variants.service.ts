import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Variant, VariantDocument } from '../schemas/variant.schema';
import {
  CreateVariantInput,
  CreateVariantOutput,
} from './dtos/create-variant.dto';
import {
  UpdateVariantInput,
  UpdateVariantOutput,
} from './dtos/update-variant.dto';

@Injectable()
export class AdminVariantsService {
  constructor(
    @InjectModel(Variant.name) private variantsModel: Model<VariantDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findVariantById(id: string): Promise<VariantDocument> {
    const variant = await this.variantsModel.findById(id);
    return variant;
  }

  async createVariant(
    createVariantInput: CreateVariantInput & { images: Express.Multer.File[] },
  ): Promise<CreateVariantOutput> {
    try {
      const uploadResult = await this.cloudinaryService.uploadImages(
        createVariantInput.images,
      );

      const newVariant = new this.variantsModel({
        ...createVariantInput,
        ...(uploadResult && {
          images: uploadResult.map((image) => image.secure_url),
        }),
      });
      newVariant.save();

      return {
        ok: true,
        variant: newVariant,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async updateVariant(
    updateVariantInput: UpdateVariantInput & { images: Express.Multer.File[] },
  ): Promise<UpdateVariantOutput> {
    try {
      const variant = await this.findVariantById(updateVariantInput._id);
      if (!variant) {
        throw new NotFoundException({
          ok: false,
          error: 'Variant does not exist',
        });
      }

      let updateObj;

      if (updateVariantInput?.images?.length) {
        if ((variant?.images as any)?.length) {
          await this.cloudinaryService.deleteImages(variant.images as any);
        }

        const uploadResult = await this.cloudinaryService.uploadImages(
          updateVariantInput.images,
        );
        updateObj = {
          images: uploadResult.map((image) => image.secure_url),
        };
      }

      if (updateVariantInput?.fragrance) {
        updateObj = {
          ...updateObj,
          fragrance: updateVariantInput?.fragrance || variant.fragrance,
        };
      }

      if (updateVariantInput?.price) {
        updateObj = {
          ...updateObj,
          price: updateVariantInput?.price || variant.price,
        };
      }

      if (updateVariantInput?.stock) {
        updateObj = {
          ...updateObj,
          stock: updateVariantInput?.stock || variant.stock,
        };
      }

      if (updateVariantInput?.discountedPrice) {
        updateObj = {
          ...updateObj,
          discountedPrice:
            updateVariantInput?.discountedPrice || variant?.discountedPrice,
        };
      }

      if (updateVariantInput?.discountedFrom) {
        updateObj = {
          ...updateObj,
          discountedFrom:
            updateVariantInput?.discountedFrom || variant?.discountedFrom,
        };
      }

      if (updateVariantInput?.discountedTo) {
        updateObj = {
          ...updateObj,
          discountedTo:
            updateVariantInput?.discountedTo || variant?.discountedTo,
        };
      }

      const updatedVariant = await this.variantsModel.findByIdAndUpdate(
        updateVariantInput._id,
        updateObj,
        { new: true },
      );

      return {
        ok: true,
        variant: updatedVariant,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async deleteVariant(_id: string): Promise<UpdateVariantOutput> {
    try {
      const variant = await this.findVariantById(_id);
      if (!variant) {
        throw new NotFoundException({
          ok: false,
          error: 'Variant does not exist',
        });
      }

      await this.cloudinaryService.deleteImages(variant.images as any);
      await this.variantsModel.findByIdAndDelete(_id);

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
