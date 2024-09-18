import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { Coupon, CouponSchema } from '../schemas/coupon.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
