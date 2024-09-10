import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { PayOSProvider } from '../payments/payments.provider';
import { ConfigModule } from '@nestjs/config';
import { PusherModule } from '../pusher/pusher.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Donation, DonationSchema } from '../schemas/donation.schema';

@Module({
  imports: [
    ConfigModule,
    PusherModule,
    MongooseModule.forFeature([
      {
        name: Donation.name,
        schema: DonationSchema,
      },
    ]),
  ],
  providers: [DonationsService, PayOSProvider],
  controllers: [DonationsController],
})
export class DonationsModule {}
