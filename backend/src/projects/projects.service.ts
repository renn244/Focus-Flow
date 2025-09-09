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

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
        @Inject(forwardRef(() => TeamService)) private readonly teamService: TeamService
    ) {}

    async createProject(body: CreateProjectDto, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.create({ ...body, ownerId })

        await this.teamService.addMember(user, { 
            projectId: project._id.toString(),
            userId: ownerId,
            role: 'owner'  
        })

        return plainToInstance(ProjectDto, project, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getProjects(user: UserJwt, query: GetProjectQueryDto) {
        const userId = user.id;
        const projectIds = await this.teamService.getProjectIdsByMemberId(new Types.ObjectId(userId));

        const projects = await this.projectModel.find({ 
            $or: [ { _id: { $in: projectIds } }, { ownerId: userId } ],
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

        const projects = await this.projectModel.find({ $or: [ { ownerId: userId }, { _id: { $in: projectIds } } ] })
            .sort({ lastSeen: -1 })
            .limit(5)

        return plainToInstance(ProjectDto, projects, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getProjectById(id: Types.ObjectId, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.findById(id).populate('ownerId', 'username email displayName avatarUrl');

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        return plainToInstance(ProjectWithOwnerDto, project, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }    

    async updateProject(id: Types.ObjectId, body: UpdateProjectDto, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.findById(id);

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        const updatedProject = await this.projectModel.findOneAndUpdate(
            { _id: id }, body, { new: true }
        ).populate('ownerId', 'username email displayName avatarUrl');
    
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
        const project = await this.projectModel.deleteOne({ _id: id });

        if(project.deletedCount === 0) {
            throw new NotFoundException("Project not found or you do not have permission to delete this project");
        }
        
        return {
            message: "Project deleted successfully"
        };
    }
} 