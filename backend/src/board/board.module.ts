import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, boardSchema } from 'src/schema/Board.schema';
import { BoardAdminAccessGuard } from './guards/BoardAdminAccessGuard';
import { BoardAccessGuard } from './guards/BoardAccessGuard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Board.name,
        schema: boardSchema
      }
    ])
  ],
  providers: [BoardService, BoardAccessGuard, BoardAdminAccessGuard],
  controllers: [BoardController],
  exports: [BoardService]
})
export class BoardModule {}
