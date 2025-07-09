import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, columnSchema } from 'src/schema/Column.schema';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Column.name,
        schema: columnSchema
      }
    ]),
    BoardModule
  ],
  providers: [ColumnService],
  controllers: [ColumnController]
})
export class ColumnModule {}
