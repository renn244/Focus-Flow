import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, boardSchema } from 'src/schema/Board.schema';
import { BoardAccessGuard } from 'src/lib/guards/BoardAccessGuard';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Board.name,
        schema: boardSchema
      }
    ]),
    BullModule.registerQueue({ name: 'audit-log-queue' })
  ],
  providers: [BoardService, BoardAccessGuard],
  controllers: [BoardController],
  exports: [BoardService]
})
export class BoardModule {}
