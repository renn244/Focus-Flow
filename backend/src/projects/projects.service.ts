import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { ClientSession, Model, Types } from 'mongoose';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { Project, ProjectDocument } from 'src/schema/Project.schema';
import { TeamService } from 'src/team/team.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectQueryDto } from './dto/get-project-query.dto';
import { ProjectDto, ProjectWithOwnerDto } from './dto/response-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { GetProjectActivityQueryDto } from 'src/audit-log/dto/get-project-activity-query.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
        @Inject(forwardRef(() => TeamService)) private readonly teamService: TeamService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async createProject(body: CreateProjectDto, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.create({ ...body, ownerId })

        await this.teamService.addMember(user, { 
            projectId: project._id.toString(),
            userId: ownerId,
            role: 'owner'  
        }, false)

        await this.auditLogService.record({
            projectId: project._id,
            actorId: user.id,
            action: 'project.created',
            entityType: 'project',
            entityId: project._id,
            summary: 'Created the project',
        });

        return plainToInstance(ProjectDto, project, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getProjects(user: UserJwt, query: GetProjectQueryDto) {
        const userId = user.id;
        const projectIds = await this.teamService.getProjectIdsByMemberId(new Types.ObjectId(userId));

        const projects = await this.projectModel.find({ 
            _id: { $in: projectIds },
            ...(query.status && query.status !== 'all' ? { status: query.status } : {}),
            ...(query.priority && query.priority !== 'all' ? { priority: query.priority } : {})
        }).populate('ownerId', 'username email displayName avatarUrl')
    
        return plainToInstance(ProjectWithOwnerDto, projects, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getRecentProjects(user: UserJwt) {
        const userId = user.id;
        const projectIds = await this.teamService.getProjectIdsByMemberId(new Types.ObjectId(userId));

        const projects = await this.projectModel.find({ _id: { $in: projectIds } })
            .sort({ lastSeen: -1 })
            .limit(5)

        return plainToInstance(ProjectDto, projects, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getProjectById(id: Types.ObjectId) {
        const project = await this.projectModel.findById(id).populate('ownerId', 'username email displayName avatarUrl');

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        return plainToInstance(ProjectWithOwnerDto, project, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }    

    async getProjectActivity(id: Types.ObjectId, query: GetProjectActivityQueryDto) {
        return this.auditLogService.getProjectActivity(id, query);
    }

    async updateProject(id: Types.ObjectId, body: UpdateProjectDto, user: UserJwt) {
        const updatedProject = await this.projectModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        ).populate('ownerId', 'username email displayName avatarUrl');
    
        if(!updatedProject) {
            throw new NotFoundException("Project not found or you do not have permission to update this project");
        }

        await this.auditLogService.record({
            projectId: updatedProject._id,
            actorId: user.id,
            action: 'project.updated',
            entityType: 'project',
            entityId: updatedProject._id,
            summary: 'Updated project details',
            changedFields: Object.keys(body),
        });

        return plainToInstance(ProjectWithOwnerDto, updatedProject, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }
    
    async addMemberToProject(projectId: Types.ObjectId, memberId: Types.ObjectId, session?: ClientSession) {
        const updatedProject = await this.projectModel.findOneAndUpdate(
            { _id: projectId }, { $push: { teamMembers: memberId } }, { new: true, session }
        ).populate('ownerId', 'username email displayName avatarUrl');

        if(!updatedProject) {
            throw new NotFoundException("Project not found");
        }

        return plainToInstance(ProjectWithOwnerDto, updatedProject, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }
 
    async removeMemberFromProject(projectId: Types.ObjectId, memberId: Types.ObjectId, session?: ClientSession) {
        const updatedProject = await this.projectModel.findOneAndUpdate(
            { _id: projectId }, { $pull: { teamMembers: memberId } }, { new: true, session }
        ).populate('ownerId', 'username email displayName avatarUrl');

        if(!updatedProject) {
            throw new NotFoundException("Project not found");
        }

        return plainToInstance(ProjectWithOwnerDto, updatedProject, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async deleteProject(id: Types.ObjectId, user: UserJwt) {
        const existingProject = await this.projectModel.findById(id).select('_id');

        if (!existingProject) {
            throw new NotFoundException("Project not found or you do not have permission to delete this project");
        }

        await this.auditLogService.record({
            projectId: existingProject._id,
            actorId: user.id,
            action: 'project.deleted',
            entityType: 'project',
            entityId: existingProject._id,
            summary: 'Deleted the project',
        });

        const project = await this.projectModel.findOneAndDelete({ _id: id });

        if(!project) {
            throw new NotFoundException("Project not found or you do not have permission to delete this project");
        }
  
        return {
            message: "Project deleted successfully"
        };
    }
}
