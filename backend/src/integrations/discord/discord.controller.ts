import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CheckResourceProjectSource } from 'src/projects/decorators/ResourceProjectSource.decorator';
import { ProjectAdminAccessGuard } from 'src/projects/guards/ProjectAdminAccessGuard';
import { TeamSharedService } from 'src/team/team.shared.service';
import { clientUrl, DiscordIntegrationService } from './discord-integration.service';
import { DiscordNotifierService } from './discord-notifier.service';
import { DiscordCallbackQueryDto, DiscordChannelDto, DiscordIntegrationDto, DiscordStatusDto, UpdateDiscordIntegrationDto } from './dto/discord.dto';

/** Project owners and admins connect the project to a Discord server and choose what gets posted. */
@ApiTags('Discord integration')
@Controller('integrations/discord')
export class DiscordController {
    constructor(
        private readonly integrations: DiscordIntegrationService,
        private readonly notifier: DiscordNotifierService,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    /**
     * Discord sends the browser here after "Add to Discord". It carries no login token, so the
     * signed state (made when the owner clicked the button) says which project and person it's for.
     */
    @ApiExcludeEndpoint()
    @Get('callback')
    async callback(@Query() query: DiscordCallbackQueryDto, @Res() res: Response) {
        const { code, error } = query;
        const state = this.integrations.readState(query.state);
        if (!state) return res.redirect(clientUrl('/projects?discord=expired'));

        const back = (result: string) => res.redirect(clientUrl(`/projects/${state.projectId}?view=settings&discord=${result}`));
        if (error || !code) return back('cancelled');

        const stillAdmin = await this.teamSharedService.isUserAdminOrOwnerInProject(new Types.ObjectId(state.projectId), state.userId);
        if (!stillAdmin) return back('forbidden');

        try {
            await this.integrations.completeInstall(state, code);
            return back('connected');
        } catch {
            return back('failed');
        }
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Discord connection for a project (owners and admins)' })
    @ApiOkResponse({ type: DiscordStatusDto })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Get('project/:projectId')
    async getStatus(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.integrations.getStatus(projectId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Address of Discord’s "add the bot to a server" page for this project' })
    @ApiOkResponse({ schema: { type: 'object', properties: { url: { type: 'string' } } } })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Post('project/:projectId/install')
    getInstallUrl(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @User() user: UserJwt) {
        return this.integrations.getInstallUrl(projectId, user);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Text channels in the connected server, with whether the bot can post in each' })
    @ApiOkResponse({ type: DiscordChannelDto, isArray: true })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Get('project/:projectId/channels')
    async listChannels(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.integrations.listChannels(projectId);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Pick the channel or switch updates on and off' })
    @ApiOkResponse({ type: DiscordIntegrationDto })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Patch('project/:projectId')
    async update(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @Body() body: UpdateDiscordIntegrationDto) {
        return this.integrations.update(projectId, body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Post a test message to the chosen channel' })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Post('project/:projectId/test')
    async sendTest(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @User() user: UserJwt) {
        return this.integrations.sendTest(projectId, user);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Post today’s due-today summary now instead of waiting for 8 AM' })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Post('project/:projectId/summary')
    async sendSummary(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.integrations.sendSummaryNow(projectId, () => this.notifier.summaryFor(projectId));
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Disconnect Discord; the bot leaves the server if no other project uses it' })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(JwtAuthGuard, ProjectAdminAccessGuard)
    @Delete('project/:projectId')
    async disconnect(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId, @User() user: UserJwt) {
        return this.integrations.disconnect(projectId, user);
    }
}
