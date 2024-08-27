import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { AuthAdminMiddleware } from './auth/admin/auth-admin.middleware';
import { AdminCategoriesModule } from './admin-categories/admin-categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminProductsModule } from './admin-products/admin-products.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminBannersModule } from './admin-banners/admin-banners.module';
import { AdminSlogansModule } from './admin-slogans/admin-slogans.module';
import { AdminVariantsModule } from './admin-variants/admin-variants.module';
import { UsersModule } from './users/users.module';
import { AuthUserMiddleware } from './auth/user/auth-user.middleware';
import { SlogansModule } from './slogans/slogans.module';
import { EmailsModule } from './emails/emails.module';
import { UserAddressesModule } from './user-addresses/user-addresses.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { PusherModule } from './pusher/pusher.module';
import { UserWishlistModule } from './user-wishlist/user-wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminReviewsModule } from './admin-reviews/admin-reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.ENV === 'prod',
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod'),
        MONGODB_URI: Joi.string().required(),
        APP_FRONTEND_URL: Joi.string().required(),
        APP_DASHBOARD_URL: Joi.string().required(),
        APP_NAME: Joi.string().required(),
        PORT: Joi.string().required(),
        // Auth
        ACCESS_TOKEN_KEY: Joi.string().required(),
        SECRET_TOKEN_KEY: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        RESET_PASSWORD_TOKEN_KEY: Joi.string().required(),
        OTP_AUTH_SECRET: Joi.string().required(),
        // Cloudinary
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_FOLDER: Joi.string().required(),
        // Email
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PORT: Joi.number().required(),
        EMAIL_USERNAME: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_FROM_ADDRESS: Joi.string().required(),
        EMAIL_FROM_NAME: Joi.string().required(),
        // PayOS
        PAYOS_CLIENT_ID: Joi.string().required(),
        PAYOS_API_KEY: Joi.string().required(),
        PAYOS_CHECKSUM_KEY: Joi.string().required(),
        // PUSHER
        PUSHER_APP_ID: Joi.string().required(),
        PUSHER_KEY: Joi.string().required(),
        PUSHER_SECRET: Joi.string().required(),
        PUSHER_CLUSTER: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AdminsModule,
    AuthModule.forRoot({
      accessTokenKey: process.env.ACCESS_TOKEN_KEY,
      secretTokenKey: process.env.SECRET_TOKEN_KEY,
      otpAuthSecret: process.env.OTP_AUTH_SECRET,
      appName: process.env.APP_NAME,
      resetPasswordTokenKey: process.env.RESET_PASSWORD_TOKEN_KEY,
    }),
    AdminCategoriesModule,
    CloudinaryModule,
    AdminProductsModule,
    CategoriesModule,
    AdminBannersModule,
    AdminSlogansModule,
    AdminVariantsModule,
    UsersModule,
    SlogansModule,
    EmailsModule,
    UserAddressesModule,
    BannersModule,
    ProductsModule,
    PaymentsModule,
    ScheduleModule.forRoot(),
    TasksModule,
    PusherModule,
    UserWishlistModule,
    ReviewsModule,
    AdminReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthAdminMiddleware)
      .forRoutes({ path: '/admins/*', method: RequestMethod.ALL });

    consumer
      .apply(AuthUserMiddleware)
      .forRoutes({ path: '/users/*', method: RequestMethod.ALL });
  }
}
