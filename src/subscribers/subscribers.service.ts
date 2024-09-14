import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoreOutput } from '../common/dtos/output.dto';
import { Subscriber, SubscriberDocument } from '../schemas/subscriber.schema';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscribersModel: Model<SubscriberDocument>,
  ) {}

  async createSubsriber(email: string): Promise<CoreOutput> {
    const existingQuestion = await this.subscribersModel.findOne({
      email,
    });

    if (existingQuestion) {
      throw new BadRequestException({
        ok: false,
        error: 'You have already subscribed.',
      });
    }

    await this.subscribersModel.create({
      email,
    });
    return { ok: true };
  }

  async unsubscribe({
    email,
    _id,
  }: {
    email: string;
    _id: string;
  }): Promise<CoreOutput> {
    const objectId = new Types.ObjectId(_id);

    const existingSubsriber = await this.subscribersModel.findOne({
      _id: objectId,
      email,
    });

    if (!existingSubsriber) {
      throw new BadRequestException({
        ok: false,
        error: 'You have not subscribed yet.',
      });
    }

    existingSubsriber.status = 'Unsubscribed';
    await existingSubsriber.save();

    return { ok: true };
  }
}
