import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import PayOS from '@payos/node';
import { Model } from 'mongoose';
import { EmailsService } from '../emails/emails.service';
import { PusherService } from '../pusher/pusher.service';
import {
  Donation,
  DonationDocument,
  StatusEnum,
} from '../schemas/donation.schema';
import { CreateDonationLinkInput } from './dtos/create-donation-link.dto';
import {
  generateOrderCode,
  isValidData,
} from '../payments/utils/check-validate';
import {
  CancelDonationLinkInput,
  CancelDonationLinkOutput,
} from './dtos/cancel-donation-link.dto';
import { ReceiveDonationWebhookOutput } from './dtos/receive-donation-webhook.dto';
import { formatCurrencyVND } from '../payments/utils/format-currency-vnd';

@Injectable()
export class DonationsService {
  constructor(
    @Inject('PAYOS') private readonly payOS: PayOS,
    @InjectModel(Donation.name) private donationsModel: Model<DonationDocument>,
    private configService: ConfigService,
    private pusherService: PusherService,
    private readonly emailsService: EmailsService,
  ) {}

  async createDonationLink(createDonationLinkInput: CreateDonationLinkInput) {
    const orderCode = generateOrderCode();

    const orderBody = {
      orderCode: orderCode,
      amount: createDonationLinkInput.amount,
      description: createDonationLinkInput.description,
      cancelUrl: createDonationLinkInput.cancelUrl,
      returnUrl: createDonationLinkInput.returnUrl,
      items: [
        {
          name: createDonationLinkInput.description,
          quantity: 1,
          price: createDonationLinkInput.amount,
        },
      ],
      buyerName: 'Anonymous',
      buyerEmail: 'Anonymous',
      buyerPhone: 'Anonymous',
      buyerAddress: 'Anonymous',
    };

    const paymentLinkResponse = await this.payOS.createPaymentLink(orderBody);
    if (paymentLinkResponse?.orderCode) {
      await this.donationsModel.create({
        orderCode: paymentLinkResponse?.orderCode,
        status: StatusEnum.pending,
        amount: createDonationLinkInput.amount,
        name: createDonationLinkInput.name,
        email: createDonationLinkInput.email,
        ...(createDonationLinkInput?.phone && {
          phone: createDonationLinkInput.phone,
        }),
        ...(createDonationLinkInput?.comment && {
          comment: createDonationLinkInput.comment,
        }),
      });
    }

    return {
      ok: true,
      data: {
        bin: paymentLinkResponse?.bin,
        checkoutUrl: paymentLinkResponse?.checkoutUrl,
        accountNumber: paymentLinkResponse?.accountNumber,
        accountName: paymentLinkResponse?.accountName,
        amount: paymentLinkResponse?.amount,
        description: paymentLinkResponse?.description,
        orderCode: paymentLinkResponse?.orderCode,
        qrCode: paymentLinkResponse?.qrCode,
        paymentLinkId: paymentLinkResponse?.paymentLinkId,
        currency: paymentLinkResponse?.currency,
      },
    };
  }

  async cancelDonationLink(
    cancelDonationLinkInput: CancelDonationLinkInput,
  ): Promise<CancelDonationLinkOutput> {
    const payment = await this.donationsModel.findOneAndUpdate(
      {
        orderCode: cancelDonationLinkInput.orderCode,
        status: StatusEnum.pending,
      },
      { status: StatusEnum.cancelled },
    );
    if (!payment) {
      throw new NotFoundException({
        ok: false,
        error: 'Donation does not exist',
      });
    }

    const order = await this.payOS.cancelPaymentLink(
      cancelDonationLinkInput.orderCode,
      'Khach hang huy dong gop',
    );
    if (!order) {
      throw new NotFoundException({
        ok: false,
        error: 'Donation does not exist',
      });
    }
    return {
      ok: true,
    };
  }

  async receiveDonationWebhook(
    data: any,
  ): Promise<ReceiveDonationWebhookOutput> {
    const donation: any = await this.donationsModel.findOne({
      orderCode: data?.data?.orderCode,
      status: StatusEnum.pending,
    });

    if (!donation) {
      throw new NotFoundException({
        ok: false,
        error: 'Donation does not exist',
      });
    }

    if (
      isValidData(
        data?.data,
        data?.signature,
        this.configService.get<string>('PAYOS_CHECKSUM_KEY'),
      )
    ) {
      donation.status = StatusEnum.paid;
      donation.transactionDateTime = new Date(data?.data?.transactionDateTime);
      await donation.save();

      await this.pusherService.trigger('donation', 'new-donation', {
        total: formatCurrencyVND(donation.amount),
      });

      await this.emailsService.sendSuccessfulDonationEmail(donation.email);

      return { ok: true };
    } else {
      donation.status = StatusEnum.cancelled;
      await donation.save();

      throw new BadRequestException({
        ok: false,
        error: 'The data does not match the signature',
      });
    }
  }
}
