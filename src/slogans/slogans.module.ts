import { Module } from '@nestjs/common';
import { SlogansController } from './slogans.controller';
import { SlogansService } from './slogans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Slogan, SloganSchema } from '../schemas/slogan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slogan.name, schema: SloganSchema }]),
  ],
  controllers: [SlogansController],
  providers: [SlogansService],
})
export class SlogansModule {}
