import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slogan, SloganDocument } from '../schemas/slogan.schema';
import { GetSlogansOutput } from './dtos/get-slogans.dto';
import { CreateSloganInput } from './dtos/create-slogan.dto';
import {
  UpdateSloganInput,
  UpdateSloganOutput,
} from './dtos/update-slogan.dto';
import { CoreOutput } from '../common/dtos/output.dto';

@Injectable()
export class AdminSlogansService {
  constructor(
    @InjectModel(Slogan.name) private slogansModel: Model<SloganDocument>,
  ) {}

  async findSloganById(_id: string): Promise<SloganDocument> {
    return this.slogansModel.findById(_id);
  }

  async findSloganByOrder(order: string): Promise<SloganDocument> {
    return this.slogansModel.findOne({ order });
  }

  async getSlogans(): Promise<GetSlogansOutput> {
    try {
      const slogans = await this.slogansModel.find().sort({ order: 1 }).lean();

      return {
        ok: true,
        slogans,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: 'Internal server error',
      });
    }
  }
  async createSlogan(createSloganInput: CreateSloganInput) {
    try {
      const sameOrderSlogan = await this.findSloganByOrder(
        createSloganInput.order,
      );

      if (sameOrderSlogan) {
        throw new BadRequestException({
          ok: false,
          error: 'Slogan with same order already exists',
        });
      }

      const newSlogan = await this.slogansModel.create({
        order: createSloganInput.order,
        content: createSloganInput.content,
        status: createSloganInput.status,
      });
      return {
        ok: true,
        slogan: newSlogan,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async updateSlogan(
    updateSloganInput: UpdateSloganInput,
  ): Promise<UpdateSloganOutput> {
    try {
      const oldSlogan = await this.findSloganById(updateSloganInput._id);

      if (!oldSlogan) {
        throw new NotFoundException({
          ok: false,
          error: 'Slogan does not exist',
        });
      }

      const sameOrderSlogan = await this.findSloganByOrder(
        updateSloganInput.order,
      );

      if (sameOrderSlogan) {
        throw new BadRequestException({
          ok: false,
          error: 'Slogan with same order already exists',
        });
      }

      const newSlogan = await this.slogansModel.findByIdAndUpdate(
        updateSloganInput._id,
        updateSloganInput,
        { new: true },
      );

      return {
        ok: true,
        slogan: newSlogan,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        ok: false,
        error: error.message,
      });
    }
  }

  async deleteSlogan(_id: string): Promise<CoreOutput> {
    try {
      const slogan = await this.findSloganById(_id);

      if (!slogan) {
        throw new NotFoundException({
          ok: false,
          error: 'Slogan does not exist',
        });
      }

      await this.slogansModel.findByIdAndDelete(_id);
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
