import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Project, ProjectDocument } from "src/schema/Project.schema";

@Injectable()
export class ProjectAdminAccessGuard implements CanActivate { 
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const projectId = request.params?.projectId || request.params?.id;

        if (!user) throw new UnauthorizedException("User not authenticated");

        const project = await this.projectModel.findById(projectId).select('ownerId').
            populate<{ teamMembers: { userId: Types.ObjectId, role: 'admin' | 'member' }[] }>('teamMembers', 'userId role');
        const admins = project?.teamMembers.filter(member => member.role === 'admin') || [];

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        // check if the user trying to access or any action is assign as admin or owner
        if(project.ownerId !== user.id && !admins.some(admin => admin.userId.toString() === user.id)) {
            return false;
        }

        return true;
    }
}