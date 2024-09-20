import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from 'src/schemas/contact.schema';
import { AdminContactsController } from './admin-contacts.controller';
import { AdminContactsService } from './admin-contacts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  controllers: [AdminContactsController],
  providers: [AdminContactsService],
})
export class AdminContactsModule {}
