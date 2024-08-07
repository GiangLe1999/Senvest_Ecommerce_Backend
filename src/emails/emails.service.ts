import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';

@Injectable()
export class EmailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyEmail(
    sendVerifyEmailInput: SendVerifyEmailInput,
  ): Promise<SendVerifyEmailOutput> {
    try {
      const { to, otp } = sendVerifyEmailInput;
      const subject = 'Verify your email address';

      await this.mailerService.sendMail({
        to,
        subject,
        template: './verify-email',
        context: {
          otp,
        },
      });

      return {
        ok: true,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
