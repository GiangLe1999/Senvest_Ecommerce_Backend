import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';

@Injectable()
export class AdminQuestionsService {
  constructor(
    @InjectModel(Question.name)
    private questionsModel: Model<QuestionDocument>,
  ) {}

  async getQuestions(): Promise<{
    ok: boolean;
    questions: QuestionDocument[];
  }> {
    const questions = await this.questionsModel
      .find()
      .populate('product')
      .lean();

    return {
      ok: true,
      questions: questions,
    };
  }
}
