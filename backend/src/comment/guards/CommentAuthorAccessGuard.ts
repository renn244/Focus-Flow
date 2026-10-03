import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from 'src/schema/Comment.schema';
import { TaskService } from 'src/task/task.service';
import { TeamSharedService } from 'src/team/team.shared.service';

@Injectable()
export class CommentAuthorAccessGuard implements CanActivate {
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
        private readonly taskService: TaskService,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const comment = await this.commentModel.findById(request.params.commentId).select('taskId authorId');

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const projectId = await this.taskService.getProjectIdByTaskId(comment.taskId);
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, user.id);

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this comment');
        }

        if (comment.authorId.toString() !== user.id) {
            throw new ForbiddenException('Only the comment author can make this change');
        }

        request.comment = comment;
        request.commentProjectId = projectId;
        return true;
    }
}
