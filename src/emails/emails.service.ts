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
import {
  SendSuccessfulPaymentEmailInput,
  SendSuccessfulPaymentEmailOutput,
} from './dtos/send-successful-payment-email.dto';
import {
  SendBirthdayCouponEmailInput,
  SendBirthdayCouponEmailOutput,
} from './dtos/send-birthday-coupon-email.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailsService {
  constructor(
    private readonly mailerService: MailerService,
    private config: ConfigService,
  ) {}

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
      const subject = 'Reset your password';

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

  async sendSuccessfulPaymentEmail(
    sendSuccessfulPaymentEmailInput: SendSuccessfulPaymentEmailInput,
  ): Promise<SendSuccessfulPaymentEmailOutput> {
    try {
      const subject = 'Thank you for ordering!';

      await this.mailerService.sendMail({
        to: sendSuccessfulPaymentEmailInput.email,
        subject,
        template: './successful-payment-email',
        context: sendSuccessfulPaymentEmailInput,
      });

      await this.mailerService.sendMail({
        to: this.config.get('OWNER_EMAIL'),
        subject,
        template: './successful-payment-email',
        context: sendSuccessfulPaymentEmailInput,
      });

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async sendSuccessfulDonationEmail(
    email: string,
  ): Promise<SendSuccessfulPaymentEmailOutput> {
    try {
      const subject = 'Thank you for your donation!';

      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './successful-donation-email',
      });

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async sendBirthdayCouponEmail(
    sendBirthdayCouponInput: SendBirthdayCouponEmailInput,
  ): Promise<SendBirthdayCouponEmailOutput> {
    try {
      const subject = 'Happy birthday to you!';

      await this.mailerService.sendMail({
        to: sendBirthdayCouponInput.email,
        subject,
        template: './birthday-coupon-email',
        context: sendBirthdayCouponInput,
      });

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
