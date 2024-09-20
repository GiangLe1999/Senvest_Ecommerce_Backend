import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from 'src/schemas/contact.schema';

@Injectable()
export class AdminContactsService {
  constructor(
    @InjectModel(Contact.name)
    private contactsModel: Model<ContactDocument>,
  ) {}

  async getContacts(): Promise<{
    ok: boolean;
    contacts: ContactDocument[];
  }> {
    const contacts = await this.contactsModel
      .find()
      .populate({ path: 'payment', model: 'Payment' })
      .lean();

    return {
      ok: true,
      contacts: contacts,
    };
  }
}
