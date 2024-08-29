import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Response } from 'express';
import { CreateQuestionInput } from './dtos/create-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async createQuestion(
    @Res() res: Response,
    @Body() createQuestionInput: CreateQuestionInput,
  ) {
    try {
      return res
        .status(HttpStatus.CREATED)
        .json(await this.questionsService.createQuestion(createQuestionInput));
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).send(error.getResponse());
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ ok: false, error: error.message });
    }
  }
}
