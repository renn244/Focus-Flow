import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment, AttachmentDocument } from 'src/schema/Attachment.schema';
import { TeamSharedService } from 'src/team/team.shared.service';

@Injectable()
export class AttachmentAccessGuard implements CanActivate {
    constructor(
        @InjectModel(Attachment.name) private readonly attachmentModel: Model<AttachmentDocument>,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const attachment = await this.attachmentModel.findById(request.params.attachmentId).select('projectId authorId');

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }

        const isMember = await this.teamSharedService.isUserMemberInProject(attachment.projectId, request.user.id);

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this attachment');
        }

        request.attachment = attachment;
        request.attachmentProjectId = attachment.projectId;
        return true;
    }
}
