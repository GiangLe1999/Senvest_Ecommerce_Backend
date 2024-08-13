import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PayOSProvider } from './payments.provider';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayOSProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
