import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Why the bot can't post right now, shown in the project's settings. */
export const DISCORD_PROBLEMS = ['bot_removed', 'channel_missing', 'no_access', 'no_permission'] as const;
export type DiscordProblem = (typeof DISCORD_PROBLEMS)[number];

@Schema({ _id: false })
export class DiscordEvents {
    @Prop({ default: true }) taskCreated: boolean;
    /** Moves between columns, including finishing a task. */
    @Prop({ default: true }) taskMoved: boolean;
    @Prop({ default: false }) noteCreated: boolean;
    /** The 8 AM list of tasks due today or overdue. */
    @Prop({ default: true }) dailySummary: boolean;
}
const discordEventsSchema = SchemaFactory.createForClass(DiscordEvents);

/** A project's link to one Discord server and the channel the bot posts in. */
@Schema({ timestamps: true })
export class DiscordIntegration {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, unique: true })
    projectId: Types.ObjectId;

    @Prop({ required: true, index: true })
    guildId: string;

    @Prop({ required: true })
    guildName: string;

    @Prop({ type: String, default: null })
    channelId: string | null;

    @Prop({ type: String, default: null })
    channelName: string | null;

    @Prop({ type: discordEventsSchema, default: () => ({}) })
    events: DiscordEvents;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    connectedBy: Types.ObjectId;

    @Prop({ type: String, enum: [...DISCORD_PROBLEMS, null], default: null })
    problem: DiscordProblem | null;
}

export const discordIntegrationSchema = SchemaFactory.createForClass(DiscordIntegration);
export type DiscordIntegrationDocument = HydratedDocument<DiscordIntegration>;
