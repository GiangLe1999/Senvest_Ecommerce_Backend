import { Injectable } from '@nestjs/common';
import { TasksService } from './tasks/tasks.service';

@Injectable()
export class AppService {
  constructor(private readonly tasksService: TasksService) {}

  checkVariantDiscountedPrice() {
    this.tasksService.checkVariantDiscountedPrice();
  }
}
