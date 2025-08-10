import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { AddMemberDto } from './dto/add-member.dto';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { Types } from 'mongoose';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
    ) {}

    // put in here instead of user because we also need to exlude the current members of the projects
    @ApiBearerAuth()
    @ApiQuery({ name: 'query', type: String, required: true, description: 'Search query for username or email' })
    @ApiQuery({ name: 'projectId', type: String, required: true, description: 'The ID of the project to search users in' })
    @Get('search-user')
    async searchUser(@Query() query: SearchUserDto, @User() user: UserJwt) {
        return this.teamService.searchUser(query.query, query.projectId, user);
    }

    @ApiBearerAuth()
    @ApiParam({ name: 'projectId', type: String, required: true, description: 'The ID of the project to get members for' })
    @Get(':projectId')
    async getMembers(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.teamService.getMembers(projectId);
    }

    @ApiBearerAuth()
    @ApiBadRequestResponse({ description: 'User is already a member of the project' })
    @Post('add-member')
    async addMember(@User() user: UserJwt, @Body() body: AddMemberDto) {
        return this.teamService.addMember(user, body);
    }

    @ApiBearerAuth()
    @ApiNotFoundResponse({ description: 'User is not a member of the project' })
    @Delete('remove-member')
    async removeMember(@User() user: UserJwt, @Body() body: RemoveMemberDto) {
        return this.teamService.removeMember(user, body);
    }
}