import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { ColumnModule } from 'src/column/column.module';
import { TaskAccessGuard } from './guards/TaskAccessGuard';
import { TaskAdminAccessGuard } from './guards/TaskAdminAccessGuard';
import { BoardModule } from 'src/board/board.module';
import { Board, boardSchema } from 'src/schema/Board.schema';
import { Column, columnSchema } from 'src/schema/Column.schema';
import { User, userSchema } from 'src/schema/User.schema';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: taskSchema
      },
      {
        name: Board.name,
        schema: boardSchema
      },
      {
        name: Column.name,
        schema: columnSchema
      },
      {
        name: User.name,
        schema: userSchema
      }
    ]),
    ColumnModule, BoardModule, AuditLogModule
  ],
  providers: [TaskService, ChecklistService, TaskAccessGuard, TaskAdminAccessGuard],
  controllers: [TaskController, ChecklistController],
  exports: [TaskService]
})
export class TaskModule {}
