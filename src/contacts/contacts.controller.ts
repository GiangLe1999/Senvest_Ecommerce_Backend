import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactInput } from './dtos/create-contact.dto';
import { Response } from 'express';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async createContact(
    @Body() createContactInput: CreateContactInput,
    @Res() res: Response,
  ) {
    try {
      return res
        .status(HttpStatus.CREATED)
        .json(await this.contactsService.createContact(createContactInput));
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
