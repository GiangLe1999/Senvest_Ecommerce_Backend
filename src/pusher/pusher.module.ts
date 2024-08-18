import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PusherService } from './pusher.service';
import { PusherProvider } from './pusher.provider';

@Module({
  imports: [ConfigModule],
  providers: [PusherService, PusherProvider],
  exports: [PusherService],
})
export class PusherModule {}
