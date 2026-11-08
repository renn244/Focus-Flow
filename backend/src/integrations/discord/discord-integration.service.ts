import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { createHmac, timingSafeEqual } from 'crypto';
import { Model, Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { DiscordIntegration, DiscordIntegrationDocument, DiscordProblem } from 'src/schema/DiscordIntegration.schema';
import { Project, ProjectDocument } from 'src/schema/Project.schema';
import { User, UserDocument } from 'src/schema/User.schema';
import {
    DISCORD_CHANNEL_DELETED, DISCORD_GUILD_REMOVED, DiscordClientService, DiscordPostError, REQUIRED_PERMISSIONS,
} from './discord-client.service';
import { testMessage } from './discord-messages';
import { UpdateDiscordIntegrationDto } from './dto/discord.dto';

const STATE_TTL_MS = 10 * 60 * 1000;

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/** Where links in Discord messages and the post-connect redirect point. */
export const clientUrl = (path: string) => `${(process.env.CLIENT_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '')}${path}`;

export const redirectUri = () =>
    process.env.DISCORD_REDIRECT_URI ?? `${process.env.PUBLIC_API_ORIGIN ?? 'http://localhost:5000'}/api/integrations/discord/callback`;

type InstallState = { projectId: string; userId: string; expiresAt: number };

/** Connecting a project to a Discord server, choosing its channel and events, and disconnecting. */
@Injectable()
export class DiscordIntegrationService {
    private readonly logger = new Logger(DiscordIntegrationService.name);

    constructor(
        @InjectModel(DiscordIntegration.name) private readonly integrationModel: Model<DiscordIntegrationDocument>,
        @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly discord: DiscordClientService,
        private readonly auditLogService: AuditLogService,
    ) {}

    // ---- the "state" parameter: proves the callback belongs to an install this server started ----

    private sign(payload: string) {
        return createHmac('sha256', process.env.DISCORD_CLIENT_SECRET ?? '').update(payload).digest('base64url');
    }

    private createState(projectId: string, userId: string) {
        const payload = base64url(JSON.stringify({ projectId, userId, expiresAt: Date.now() + STATE_TTL_MS } satisfies InstallState));
        return `${payload}.${this.sign(payload)}`;
    }

    /** The project and user from a state value, or null if it was tampered with or expired. */
    readState(state: string | undefined): InstallState | null {
        const [payload, signature] = (state ?? '').split('.');
        if (!payload || !signature) return null;
        const expected = Buffer.from(this.sign(payload));
        const given = Buffer.from(signature);
        if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

        try {
            const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as InstallState;
            return parsed.expiresAt > Date.now() ? parsed : null;
        } catch {
            return null;
        }
    }

    // ---- reading and connecting ----

    async getStatus(projectId: Types.ObjectId) {
        const integration = await this.integrationModel.findOne({ projectId });
        return {
            configured: this.discord.configured,
            botOnline: this.discord.online,
            integration: integration ? this.toDto(integration) : null,
        };
    }

    getInstallUrl(projectId: Types.ObjectId, user: UserJwt) {
        if (!this.discord.configured) {
            throw new ServiceUnavailableException('The Discord bot is not set up on this server');
        }
        const permissions = REQUIRED_PERMISSIONS.reduce((sum, flag) => sum | flag, 0n).toString();
        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            scope: 'bot',
            permissions,
            response_type: 'code',
            redirect_uri: redirectUri(),
            state: this.createState(projectId.toString(), user.id),
            integration_type: '0',
        });
        return { url: `https://discord.com/oauth2/authorize?${params}` };
    }

    /**
     * Finishes "Add to Discord". The code is exchanged with Discord, which answers with the
     * server the person actually picked, so a forged guild id in the address can't be used.
     */
    async completeInstall(state: InstallState, code: string) {
        const response = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri() }),
        });
        const body = (await response.json().catch(() => ({}))) as { guild?: { id: string; name: string }; error?: string };
        if (!response.ok || !body.guild) {
            this.logger.warn(`Discord install exchange failed: ${response.status} ${body.error ?? ''}`);
            throw new BadRequestException('Discord did not confirm the server');
        }

        const projectId = new Types.ObjectId(state.projectId);
        const existing = await this.integrationModel.findOne({ projectId });
        const sameGuild = existing?.guildId === body.guild.id;

        await this.integrationModel.updateOne(
            { projectId },
            {
                $set: {
                    guildId: body.guild.id,
                    guildName: body.guild.name,
                    connectedBy: new Types.ObjectId(state.userId),
                    problem: null,
                    // A different server means the old channel doesn't apply.
                    ...(sameGuild ? {} : { channelId: null, channelName: null }),
                },
            },
            { upsert: true },
        );

        if (existing && !sameGuild) await this.leaveIfUnused(existing.guildId);

        await this.auditLogService.record({
            projectId,
            actorId: state.userId,
            action: 'integration.connected',
            entityType: 'project',
            entityId: projectId,
            summary: `Connected the Discord server “${body.guild.name}”`,
        });
        return { projectId: state.projectId };
    }

    async listChannels(projectId: Types.ObjectId) {
        const integration = await this.require(projectId);
        try {
            return await this.discord.listChannels(integration.guildId);
        } catch (error) {
            await this.recordProblem(integration, error);
            throw new BadRequestException((error as DiscordPostError).message);
        }
    }

    async update(projectId: Types.ObjectId, body: UpdateDiscordIntegrationDto) {
        const integration = await this.require(projectId);

        if (body.channelId !== undefined) {
            const channels = await this.listChannels(projectId);
            const channel = channels.find((item) => item.id === body.channelId);
            if (!channel) throw new BadRequestException('That channel is not in the connected server');
            if (!channel.canPost) {
                throw new BadRequestException(`The bot can't post in #${channel.name}. Give it View Channel, Send Messages and Embed Links there.`);
            }
            integration.channelId = channel.id;
            integration.channelName = channel.name;
            integration.problem = null;
        }
        if (body.events) {
            integration.events = { ...integration.events, ...body.events };
            integration.markModified('events');
        }

        await integration.save();
        return this.toDto(integration);
    }

    async sendTest(projectId: Types.ObjectId, user: UserJwt) {
        const integration = await this.require(projectId);
        if (!integration.channelId) throw new BadRequestException('Pick a channel first');

        const [project, actor] = await Promise.all([
            this.projectModel.findById(projectId).select('name'),
            this.userModel.findById(user.id).select('displayName username'),
        ]);
        const sent = await this.post(integration, testMessage(project?.name ?? 'this project', actor?.displayName || actor?.username || 'Someone', clientUrl(`/projects/${projectId}`)));
        if (!sent.ok) throw new BadRequestException(sent.message);
        return { message: 'Test message sent' };
    }

    /** Posts the due-today summary on demand. `build` returns null when nothing is due. */
    async sendSummaryNow(projectId: Types.ObjectId, build: () => Promise<Parameters<DiscordClientService['send']>[1] | null>) {
        const integration = await this.require(projectId);
        if (!integration.channelId) throw new BadRequestException('Pick a channel first');

        const payload = await build();
        if (!payload) return { message: 'Nothing is due today, so there was nothing to post' };
        const sent = await this.post(integration, payload);
        if (!sent.ok) throw new BadRequestException(sent.message);
        return { message: 'Summary posted' };
    }

    async disconnect(projectId: Types.ObjectId, user: UserJwt) {
        const integration = await this.integrationModel.findOneAndDelete({ projectId });
        if (!integration) throw new NotFoundException('Discord is not connected');

        await this.leaveIfUnused(integration.guildId);
        await this.auditLogService.record({
            projectId,
            actorId: user.id,
            action: 'integration.disconnected',
            entityType: 'project',
            entityId: projectId,
            summary: `Disconnected the Discord server “${integration.guildName}”`,
        });
        return { message: 'Discord disconnected' };
    }

    // ---- posting, shared with the notifier ----

    /** Posts and keeps the integration's problem up to date. Never throws. */
    async post(integration: DiscordIntegrationDocument, payload: Parameters<DiscordClientService['send']>[1]) {
        if (!integration.channelId) return { ok: false as const, message: 'No channel picked' };
        try {
            await this.discord.send(integration.channelId, payload);
            if (integration.problem) await this.integrationModel.updateOne({ _id: integration._id }, { problem: null });
            return { ok: true as const };
        } catch (error) {
            await this.recordProblem(integration, error);
            return { ok: false as const, message: (error as Error).message };
        }
    }

    private async recordProblem(integration: DiscordIntegrationDocument, error: unknown) {
        const problem: DiscordProblem | null = error instanceof DiscordPostError ? error.problem : null;
        if (problem && problem !== integration.problem) {
            await this.integrationModel.updateOne({ _id: integration._id }, { problem });
        }
    }

    @OnEvent(DISCORD_GUILD_REMOVED)
    async onGuildRemoved(guildId: string) {
        await this.integrationModel.updateMany({ guildId }, { problem: 'bot_removed' });
    }

    @OnEvent(DISCORD_CHANNEL_DELETED)
    async onChannelDeleted(channelId: string) {
        await this.integrationModel.updateMany({ channelId }, { problem: 'channel_missing', channelId: null, channelName: null });
    }

    private async leaveIfUnused(guildId: string) {
        if (!(await this.integrationModel.exists({ guildId }))) await this.discord.leaveGuild(guildId);
    }

    private async require(projectId: Types.ObjectId) {
        const integration = await this.integrationModel.findOne({ projectId });
        if (!integration) throw new NotFoundException('Discord is not connected to this project');
        return integration;
    }

    private toDto(integration: DiscordIntegrationDocument) {
        return {
            guildId: integration.guildId,
            guildName: integration.guildName,
            channelId: integration.channelId,
            channelName: integration.channelName,
            events: {
                taskCreated: integration.events?.taskCreated ?? true,
                taskMoved: integration.events?.taskMoved ?? true,
                noteCreated: integration.events?.noteCreated ?? false,
                dailySummary: integration.events?.dailySummary ?? true,
            },
            problem: integration.problem,
        };
    }
}
