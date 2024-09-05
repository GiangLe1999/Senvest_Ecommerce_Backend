import { Module } from '@nestjs/common';
import { UserPaymentsService } from './user-payments.service';
import { UserPaymentsController } from './user-payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  providers: [UserPaymentsService],
  controllers: [UserPaymentsController],
})
export class UserPaymentsModule {}
