import { Module } from '@nestjs/common';
import { AdminSubscribersController } from './admin-subscribers.controller';
import { AdminSubscribersService } from './admin-subscribers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from '../schemas/subscriber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [AdminSubscribersController],
  providers: [AdminSubscribersService],
})
export class AdminSubscribersModule {}
