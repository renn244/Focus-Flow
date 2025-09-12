import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectQueryDto } from './dto/get-project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { CheckResourceProjectSource } from './decorators/ResourceProjectSource.decorator';
import { ProjectAccessGuard } from './guards/ProjectAccessGuard';
import { ProjectAdminAccessGuard } from './guards/ProjectAdminAccessGuard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
    ) {}

    @ApiBearerAuth()
    @Post()
    async createProject(@Body() body: CreateProjectDto, @User() user: UserJwt) {
        return this.projectsService.createProject(body, user);
    }

    @ApiBearerAuth()
    @Get()
    async getProjects(@User() user: UserJwt, @Query() query: GetProjectQueryDto) {
        return this.projectsService.getProjects(user, query);
    }

    @ApiBearerAuth()
    @Get('recent')
    async getRecentProjects(@User() user: UserJwt) {
        return this.projectsService.getRecentProjects(user);
    }

    @ApiParam({ name: 'id', type: String,  example: '60c72b2f9b1e8c001c8e4d3a', description: 'Project Id (ObjectId)' })
    @ApiBearerAuth()
    @CheckResourceProjectSource({ source: 'params', key: 'id' })
    @UseGuards(ProjectAccessGuard)
    @Get(':id')
    async getProjectById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.projectsService.getProjectById(id);
    }

    @ApiParam({ name: 'id', type: String, description: 'Project Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceProjectSource({ source: 'params', key: 'id' })
    @UseGuards(ProjectAdminAccessGuard)
    @Patch(':id')
    async updateProject(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() body: UpdateProjectDto) {
        return this.projectsService.updateProject(id, body);
    }

    @ApiParam({ name: 'id', type: String, description: 'Project Id (ObjectId)', example: '60c72b2f9b1e8c001c8e4d3a' })
    @ApiBearerAuth()
    @CheckResourceProjectSource({ source: 'params', key: 'id' })
    @UseGuards(ProjectAdminAccessGuard)
    @Delete(':id')
    async deleteProject(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
        return this.projectsService.deleteProject(id);
    }
}
