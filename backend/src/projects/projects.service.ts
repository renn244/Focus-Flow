import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from 'src/schema/Project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetProjectQueryDto } from './dto/get-project-query.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument> 
    ) {}

    async createProject(body: CreateProjectDto, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.create({ ...body, ownerId })

        return project;
    }

    async getProjects(user: UserJwt, query: GetProjectQueryDto) {
        const ownerId = user.id;
        const projects = await this.projectModel.find({ 
            ownerId, 
            ...(query.status && query.status !== 'all' ? { status: query .status } : {}),
            ...(query.priority && query.priority !== 'all' ? { priority: query.priority } : {})
        }).populate('ownerId', 'username email displayName avatarUrl')
    
        return projects;
    }

    async getRecentProjects(user: UserJwt) {
        const ownerId = user.id;
        const projects = await this.projectModel.find({ ownerId })
            .sort({ lastSeen: -1 })
            .limit(5)

        return projects;
    }

    async getProjectById(id: Types.ObjectId, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.findById(id).populate('ownerId', 'username email displayName avatarUrl');

        if(!project) {
            throw new NotFoundException("Project not found");
        }
        
        if(project.ownerId._id.toString() !== ownerId) {
            throw new ForbiddenException("You do not have permission to access this project info");
        }

        return project
    }

    

    async updateProject(id: Types.ObjectId, body: UpdateProjectDto, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.findById(id);

        if(!project) {
            throw new NotFoundException("Project not found");
        }

        if(project.ownerId.toString() !== ownerId) {
            throw new ForbiddenException("You do not have permission to update this project");
        }

        const updatedProject = await this.projectModel.findOneAndUpdate(
            { _id: id, ownerId }, body, { new: true }
        ).populate('ownerId', 'username email displayName avatarUrl');
    
        return updatedProject;
    }

    async deleteProject(id: Types.ObjectId, user: UserJwt) {
        const ownerId = user.id;
        const project = await this.projectModel.deleteOne({ _id: id, ownerId });

        if(project.deletedCount === 0) {
            throw new NotFoundException("Project not found or you do not have permission to delete this project");
        }
        
        return {
            message: "Project deleted successfully"
        };
    }
}