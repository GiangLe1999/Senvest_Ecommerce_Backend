import { Module } from '@nestjs/common';
import { AdminPaymentsService } from './admin-payments.service';
import { AdminPaymentsController } from './admin-payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PusherModule } from '../pusher/pusher.module';
import { Payment, PaymentSchema } from '../schemas/payment.schema';

@Module({
  imports: [
    ConfigModule,
    PusherModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  providers: [AdminPaymentsService],
  controllers: [AdminPaymentsController],
})
export class AdminPaymentsModule {}
