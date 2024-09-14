import { Module } from '@nestjs/common';
import { SubscribersController } from './subscribers.controller';
import { SubscribersService } from './subscribers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from '../schemas/subscriber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [SubscribersController],
  providers: [SubscribersService],
})
export class SubscribersModule {}
