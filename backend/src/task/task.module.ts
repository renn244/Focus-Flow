import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { ColumnModule } from 'src/column/column.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_NAMES } from 'src/lib/constants/RABBITMQ';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_NAMES.TASK_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'task_queue',
        }
      }
    ]),
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
