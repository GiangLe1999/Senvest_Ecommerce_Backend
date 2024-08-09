import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';
import {
  SendResetPasswordEmailInput,
  SendResetPasswordEmailOutput,
} from './dtos/send-reset-password-email.dto';

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

  async sendResetPasswordEmail(
    sendResetPasswordEmailInput: SendResetPasswordEmailInput,
  ): Promise<SendResetPasswordEmailOutput> {
    try {
      const { email, emailLink, link } = sendResetPasswordEmailInput;
      const subject = 'Verify your email address';

      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './reset-password-email',
        context: {
          email,
          emailLink,
          link,
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
