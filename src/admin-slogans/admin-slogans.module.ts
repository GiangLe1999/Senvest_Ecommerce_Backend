import { Module } from '@nestjs/common';
import { AdminSlogansController } from './admin-slogans.controller';
import { AdminSlogansService } from './admin-slogans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Slogan, SloganSchema } from '../schemas/slogan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slogan.name, schema: SloganSchema }]),
  ],
  controllers: [AdminSlogansController],
  providers: [AdminSlogansService],
})
export class AdminSlogansModule {}
