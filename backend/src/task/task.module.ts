import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { ColumnModule } from 'src/column/column.module';
import { TaskAccessGuard } from './guards/TaskAccessGuard';
import { TaskAdminAccessGuard } from './guards/TaskAdminAccessGuard';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: taskSchema
      }
    ]),
    ColumnModule, BoardModule
  ],
  providers: [TaskService, TaskAccessGuard, TaskAdminAccessGuard],
  controllers: [TaskController]
})
export class TaskModule {}
