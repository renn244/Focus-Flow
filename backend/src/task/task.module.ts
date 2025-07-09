import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { ColumnModule } from 'src/column/column.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: taskSchema
      }
    ]),
    ColumnModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
