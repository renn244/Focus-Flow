import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Project, ProjectDocument } from "src/schema/Project.schema";

@Injectable()
export class ProjectAccessGuard implements CanActivate {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    ) {}

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const projectId = request.params?.projectId || request.params?.id;
        
        if (!user) throw new UnauthorizedException("User not authenticated");

        const project = await this.projectModel.findById(projectId).select('ownerId')
            .populate<{ teamMembers: { userId: Types.ObjectId }[] }>('teamMembers', 'userId');
        const memberIds = project?.teamMembers.map(member => member.userId.toString()) || [];

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        // LATER check a role based access control in place
        // Check if the user is the owner of the project or a member
        if(project.ownerId.toString() !== user.id && !memberIds?.includes(user.id)) {
            return false;
        }

        return true;
    }
}