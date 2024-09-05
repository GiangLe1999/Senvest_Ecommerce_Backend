import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact, ContactDocument } from '../schemas/contact.schema';
import {
  CreateContactInput,
  CreateContactOutput,
} from './dtos/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private reviewsModel: Model<ContactDocument>,
  ) {}

  async createContact(
    createContactInput: CreateContactInput,
  ): Promise<CreateContactOutput> {
    await this.reviewsModel.create({
      ...createContactInput,
      payment: new Types.ObjectId(createContactInput.payment_id),
    });

    return { ok: true };
  }
}
