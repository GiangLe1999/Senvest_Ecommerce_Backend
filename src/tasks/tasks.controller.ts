import { Response } from 'express';
import { TasksService } from './tasks.service';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('birthday')
  async get(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.tasksService.createBirthdayCoupons());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
