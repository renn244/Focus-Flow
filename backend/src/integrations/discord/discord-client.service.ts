import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChannelType, Client, DiscordAPIError, Events, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import type { DiscordProblem } from 'src/schema/DiscordIntegration.schema';
import type { DiscordMessage } from './discord-messages';

export const DISCORD_GUILD_REMOVED = 'discord.guildRemoved';
export const DISCORD_CHANNEL_DELETED = 'discord.channelDeleted';

/** What the bot needs in a channel to post updates. */
export const REQUIRED_PERMISSIONS = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks];

/** A failure Discord reported, turned into a reason the settings page can explain. */
export class DiscordPostError extends Error {
    constructor(readonly problem: DiscordProblem | null, message: string) {
        super(message);
    }
}

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
const problemByCode: Record<number, DiscordProblem> = {
    10003: 'channel_missing', // Unknown channel
    10004: 'bot_removed', // Unknown guild
    50001: 'no_access', // Missing access
    50013: 'no_permission', // Missing permissions
};

export type ChannelOption = { id: string; name: string; category: string | null; canPost: boolean };

/**
 * The bot's connection to Discord. It logs in when the backend starts (if a token is set)
 * and only needs the Guilds intent: it posts messages and never reads them.
 */
@Injectable()
export class DiscordClientService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DiscordClientService.name);
    private client: Client | null = null;

    constructor(private readonly events: EventEmitter2) {}

    get configured() {
        return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    }

    get online() {
        return Boolean(this.client?.isReady());
    }

    async onModuleInit() {
        if (!process.env.DISCORD_BOT_TOKEN) {
            this.logger.warn('DISCORD_BOT_TOKEN is not set; the Discord bot is off.');
            return;
        }

        const client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.once(Events.ClientReady, (ready) => this.logger.log(`Discord bot online as ${ready.user.tag}`));
        client.on(Events.GuildDelete, (guild) => this.events.emit(DISCORD_GUILD_REMOVED, guild.id));
        client.on(Events.ChannelDelete, (channel) => this.events.emit(DISCORD_CHANNEL_DELETED, channel.id));
        client.on(Events.Error, (error) => this.logger.error(`Discord client error: ${error.message}`));
        this.client = client;

        // Don't hold up the rest of the app if Discord is slow or the token is wrong.
        client.login(process.env.DISCORD_BOT_TOKEN).catch((error: Error) => {
            this.logger.error(`Discord bot could not log in: ${error.message}`);
        });
    }

    async onModuleDestroy() {
        await this.client?.destroy();
    }

    private ready() {
        if (!this.client?.isReady()) {
            throw new DiscordPostError(null, 'The Discord bot is offline right now. Try again in a minute.');
        }
        return this.client;
    }

    private toPostError(error: unknown): DiscordPostError {
        if (error instanceof DiscordPostError) return error;
        if (error instanceof DiscordAPIError && typeof error.code === 'number' && problemByCode[error.code]) {
            return new DiscordPostError(problemByCode[error.code], error.message);
        }
        return new DiscordPostError(null, error instanceof Error ? error.message : 'Discord did not accept the message');
    }

    /** The server's text channels, with whether the bot is allowed to post in each. */
    async listChannels(guildId: string): Promise<ChannelOption[]> {
        try {
            const guild = await this.ready().guilds.fetch(guildId);
            const me = await guild.members.fetchMe();
            const channels = await guild.channels.fetch();

            return [...channels.values()]
                .filter((channel) => channel && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement))
                .map((channel) => channel!)
                .sort((a, b) => (a.parent?.position ?? -1) - (b.parent?.position ?? -1) || a.position - b.position)
                .map((channel) => ({
                    id: channel.id,
                    name: channel.name,
                    category: channel.parent?.name ?? null,
                    canPost: Boolean(channel.permissionsFor(me)?.has(REQUIRED_PERMISSIONS)),
                }));
        } catch (error) {
            throw this.toPostError(error);
        }
    }

    async send(channelId: string, payload: DiscordMessage) {
        try {
            const channel = await this.ready().channels.fetch(channelId);
            if (!channel || !channel.isSendable()) {
                throw new DiscordPostError('channel_missing', 'That channel no longer exists');
            }
            await channel.send(payload);
        } catch (error) {
            throw this.toPostError(error);
        }
    }

    /** Removes the bot from a server no project uses any more. */
    async leaveGuild(guildId: string) {
        try {
            const guild = await this.ready().guilds.fetch(guildId);
            await guild.leave();
        } catch (error) {
            this.logger.warn(`Could not leave Discord server ${guildId}: ${(error as Error).message}`);
        }
    }
}
