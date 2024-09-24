import { Module } from '@nestjs/common';
import { AdminDonationsController } from './admin-donations.controller';
import { AdminDonationsService } from './admin-donations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Donation, DonationSchema } from '../schemas/donation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Donation.name,
        schema: DonationSchema,
      },
    ]),
  ],
  controllers: [AdminDonationsController],
  providers: [AdminDonationsService],
})
export class AdminDonationsModule {}
