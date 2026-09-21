import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, commentSchema } from 'src/schema/Comment.schema';
import { TaskModule } from 'src/task/task.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentAuthorAccessGuard } from './guards/CommentAuthorAccessGuard';
import { CommentTaskAccessGuard } from './guards/CommentTaskAccessGuard';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: commentSchema }]),
        TaskModule,
    ],
    controllers: [CommentController],
    providers: [CommentService, CommentAuthorAccessGuard, CommentTaskAccessGuard],
})
export class CommentModule {}
