import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminQuestionsController } from './admin-questions.controller';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { AdminQuestionsService } from './admin-questions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [AdminQuestionsController],
  providers: [AdminQuestionsService],
})
export class AdminQuestionsModule {}
