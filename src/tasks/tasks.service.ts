import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Variant, VariantDocument } from '../schemas/variant.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Variant.name)
    private readonly variantsModel: Model<VariantDocument>,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkVariantDiscountedPrice() {
    const now = new Date();

    // Find all variants
    const variants = await this.variantsModel.find().exec();

    for (const variant of variants) {
      if (variant?.discountedPrice && now > variant.discountedTo) {
        // Instead of deleting, set the properties to undefined
        variant.discountedPrice = undefined;
        variant.discountedFrom = undefined;
        variant.discountedTo = undefined;

        console.log(
          `Variant ${variant._id} is not within the discount period. Disable discounted price.`,
        );

        await variant.save();
      }
    }

    console.log('Check and update of discounted prices completed.');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchFrontendURL() {
    const frontend_url = process.env.APP_FRONTEND_URL;
    const backend_url = process.env.APP_BACKEND_URL;

    await axios.get(frontend_url);
    console.log(`Successfully fetched ${frontend_url}`);

    await axios.get(backend_url);
    console.log(`Successfully fetched ${backend_url}`);
  }
}
