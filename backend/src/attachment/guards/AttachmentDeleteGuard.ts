import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { TeamSharedService } from 'src/team/team.shared.service';

@Injectable()
export class AttachmentDeleteGuard implements CanActivate {
    constructor(private readonly teamSharedService: TeamSharedService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (request.attachment.authorId.toString() === request.user.id) {
            return true;
        }

        const isAdmin = await this.teamSharedService.isUserAdminOrOwnerInProject(
            request.attachmentProjectId,
            request.user.id,
        );

        if (!isAdmin) {
            throw new ForbiddenException('Only the uploader or a project admin can remove this attachment');
        }

        return true;
    }
}
