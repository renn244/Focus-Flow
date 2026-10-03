import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { AddMemberDto } from './dto/add-member.dto';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { Types } from 'mongoose';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { getMember, getUserInfo, SearchUserDto } from './dto/search-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CheckResourceTeamSource } from './decorators/ResourceTeamSource.decorator';
import { TeamAdminAccessGuard } from './guards/TeamAdminAccessGuard';
import { TeamAccessGuard } from './guards/TeamAccessGuard';
import { GetTeamMembersTableQueryDto } from './dto/get-team-members-table-query.dto';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
    ) {}

    @ApiBearerAuth()
    @ApiQuery({ name: 'projectId', type: String, required: true, description: 'The ID of the project to search users in' })
    @ApiQuery({ name: 'memberId', type: String, required: false, description: 'The ID of the member to find' })
    @CheckResourceTeamSource({ source: 'query', key: 'memberId' })
    @UseGuards(TeamAccessGuard)
    @Get()
    async getMember(@Query() query: getMember, @User() user: UserJwt) {
        return this.teamService.getMember(query.projectId, query.memberId);
    }

    // put in here instead of user because we also need to exlude the current members of the projects
    @ApiBearerAuth()
    @ApiQuery({ name: 'query', type: String, required: true, description: 'Search query for username or email' })
    @ApiQuery({ name: 'projectId', type: String, required: true, description: 'The ID of the project to search users in' })
    // use project guard to check if the user searching is a member of the project
    @Get('search-user')
    async searchUser(@Query() query: SearchUserDto, @User() user: UserJwt) {
        return this.teamService.searchUser(query.query, query.projectId, user);
    }

    @ApiBearerAuth()
    @ApiQuery({ name: 'userId', type: String, required: true, description: 'The ID of the user to get the info' })
    @ApiQuery({ name: 'projectId', type: String, required: true, description: 'The ID of t he project to search users in' })
    // use userguard to check if the user is amember of the project
    @Get('user-info')
    async getUserInfo(@Query() query: getUserInfo, @User() user: UserJwt) {
        return this.teamService.getUserInfo(query.userId, query.projectId);
    }

    @ApiBearerAuth()
    // use project guard to check if the user is a member of the project
    @Get('active-members/:projectId')
    async getActiveMembers(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.teamService.getActiveMembers(projectId);
    }

    @ApiBearerAuth()
    @ApiParam({ name: 'projectId', type: String, required: true, description: 'The ID of the project to get team members for' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'One-based page number', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Maximum results per page', example: 10 })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Case-insensitive member name, username, or email search' })
    @ApiQuery({ name: 'sortBy', enum: ['member', 'role', 'email', 'joined'], required: false })
    @ApiQuery({ name: 'sortOrder', enum: ['asc', 'desc'], required: false })
    @Get('members/:projectId')
    async getMembersTable(
        @User() user: UserJwt,
        @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
        @Query() query: GetTeamMembersTableQueryDto,
    ) {
        return this.teamService.getMembersTable(user, projectId, query);
    }

    @ApiBearerAuth()
    @ApiParam({ name: 'projectId', type: String, required: true, description: 'The ID of the project to get members for' })
    // use project guard to check if the user is a member of the project
    @Get(':projectId')
    async getMembers(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.teamService.getMembers(projectId);
    }

    @ApiBearerAuth()
    @ApiBadRequestResponse({ description: 'User is already a member of the project' })
    // use project guard to check if the user adding is a member of the project
    @Post('add-member')
    async addMember(@User() user: UserJwt, @Body() body: AddMemberDto) {
        return this.teamService.addMember(user, body);
    }

    @ApiBearerAuth()
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @CheckResourceTeamSource({ source: 'params', key: 'memberId' })
    @UseGuards(TeamAdminAccessGuard)
    @Patch('update-role/:memberId')
    async updateRole(@User() user: UserJwt, @Param('memberId', ParseObjectIdPipe) memberId: Types.ObjectId, 
    @Body() body: UpdateRoleDto) {
        return this.teamService.updateRole(user, memberId, body);
    }

    @ApiBearerAuth()
    @ApiNotFoundResponse({ description: 'User is not a member of the project' })
    // use combination of projectguard and user guard
    @Delete('remove-member')
    async removeMember(@User() user: UserJwt, @Body() body: RemoveMemberDto) {
        return this.teamService.removeMember(user, body);
    }
}
