import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slogan, SloganDocument } from 'src/schemas/slogan.schema';
import { GetSlogansOutput } from './dtos/get-slogans.dto';

@Injectable()
export class SlogansService {
  constructor(
    @InjectModel(Slogan.name) private slogansModel: Model<SloganDocument>,
  ) {}

  async getSlogans(): Promise<GetSlogansOutput> {
    try {
      const slogans = await this.slogansModel
        .find({ status: 'Active' })
        .select('content')
        .sort({ order: 1 })
        .lean();
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
}
