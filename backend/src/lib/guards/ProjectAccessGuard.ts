import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
        const projectId = request.params?.projectId;
        
        if (!user) throw new UnauthorizedException("User not authenticated");

        const project = await this.projectModel.findById(projectId).select('ownerId')

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        // later on also add if the user is a member of the project
        // or if there is a role based access control in place
        // Check if the user is the owner of the project
        if(project.ownerId.toString() !== user._id.toString()) {
            return false;
        }

        return true;
    }
}