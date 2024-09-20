import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthAdminGuard } from '../auth/admin/auth-admin.guard';
import { AdminQuestionsService } from './admin-questions.service';

@Controller('admins/admin-questions')
export class AdminQuestionsController {
  constructor(private readonly adminQuestionsService: AdminQuestionsService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  async getQuestions(@Res() res: Response) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.adminQuestionsService.getQuestions());
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
