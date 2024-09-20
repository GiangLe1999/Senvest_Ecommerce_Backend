import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from 'src/schemas/subscriber.schema';

@Injectable()
export class AdminSubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscribersModel: Model<SubscriberDocument>,
  ) {}

  async getSubscribers(): Promise<{
    ok: boolean;
    subscribers: SubscriberDocument[];
  }> {
    const subscribers = await this.subscribersModel.find().lean();

    return {
      ok: true,
      subscribers: subscribers,
    };
  }
}
