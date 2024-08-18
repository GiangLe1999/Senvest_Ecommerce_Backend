import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

export const PusherProvider = {
  provide: 'PUSHER',
  useFactory: (configService: ConfigService) => {
    return new Pusher({
      appId: configService.get<string>('PUSHER_APP_ID'),
      key: configService.get<string>('PUSHER_KEY'),
      secret: configService.get<string>('PUSHER_SECRET'),
      cluster: configService.get<string>('PUSHER_CLUSTER'),
    });
  },
  inject: [ConfigService],
};
