import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Donation, DonationDocument } from '../schemas/donation.schema';

@Injectable()
export class AdminDonationsService {
  constructor(
    @InjectModel(Donation.name) private donationsModel: Model<DonationDocument>,
  ) {}

  async getDonations() {
    const donations = await this.donationsModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return { ok: true, donations };
  }
}
