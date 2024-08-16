import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { Variant, VariantSchema } from '../schemas/variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
