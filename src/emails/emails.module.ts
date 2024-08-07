import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { EmailsService } from './emails.service';
import {
  EMAIL_FROM_ADDRESS,
  EMAIL_FROM_NAME,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
} from './emails.contants';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>(EMAIL_HOST),
          port: configService.get<number>(EMAIL_PORT),
          secure: true,
          auth: {
            user: configService.get<string>(EMAIL_USERNAME),
            pass: configService.get<string>(EMAIL_PASSWORD),
          },
        },
        defaults: {
          from: `"${configService.get<string>(EMAIL_FROM_NAME)}" <${configService.get<string>(EMAIL_FROM_ADDRESS)}>`,
        },
        template: {
          dir: join(process.cwd(), 'dist', 'emails', 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
