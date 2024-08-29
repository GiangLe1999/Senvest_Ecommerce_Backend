import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { CreateQuestionInput } from './dtos/create-question.dto';
import { CreateBannerOutput } from '../admin-banners/dtos/create-banner.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private reviewsModel: Model<QuestionDocument>,
  ) {}

  async createQuestion(
    createQuestionInput: CreateQuestionInput,
  ): Promise<CreateBannerOutput> {
    const existingQuestion = await this.reviewsModel.findOne({
      email: createQuestionInput.email,
      product: new Types.ObjectId(createQuestionInput.product),
    });

    if (existingQuestion) {
      throw new BadRequestException({
        ok: false,
        error: 'You have already asked a question about this product',
      });
    }

    await this.reviewsModel.create({
      ...createQuestionInput,
      product: new Types.ObjectId(createQuestionInput.product),
    });
    return { ok: true };
  }
}
