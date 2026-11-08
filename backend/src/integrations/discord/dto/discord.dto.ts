import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { DISCORD_PROBLEMS, DiscordProblem } from 'src/schema/DiscordIntegration.schema';

/** What Discord adds to the address when it sends the browser back after "Add to Discord". */
export class DiscordCallbackQueryDto {
    @IsOptional() @IsString() code?: string;
    @IsOptional() @IsString() state?: string;
    /** Set when the person cancels on Discord's page. */
    @IsOptional() @IsString() error?: string;
    @IsOptional() @IsString() guild_id?: string;
    @IsOptional() @IsString() permissions?: string;
}

export class DiscordEventsDto {
    @ApiPropertyOptional() @IsOptional() @IsBoolean() taskCreated?: boolean;
    @ApiPropertyOptional({ description: 'Moves between columns, including finishing a task' }) @IsOptional() @IsBoolean() taskMoved?: boolean;
    @ApiPropertyOptional() @IsOptional() @IsBoolean() noteCreated?: boolean;
    @ApiPropertyOptional({ description: 'The 8 AM list of tasks due today or overdue' }) @IsOptional() @IsBoolean() dailySummary?: boolean;
}

export class UpdateDiscordIntegrationDto {
    @ApiPropertyOptional({ description: 'Channel the bot posts in; must be in the connected server' })
    @IsOptional()
    @IsString()
    @Matches(/^\d{17,20}$/, { message: 'Invalid channel id' })
    channelId?: string;

    @ApiPropertyOptional({ type: DiscordEventsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => DiscordEventsDto)
    events?: DiscordEventsDto;
}

export class DiscordIntegrationDto {
    @ApiProperty() guildId: string;
    @ApiProperty() guildName: string;
    @ApiProperty({ nullable: true }) channelId: string | null;
    @ApiProperty({ nullable: true }) channelName: string | null;
    @ApiProperty({ type: DiscordEventsDto }) events: Required<DiscordEventsDto>;
    @ApiProperty({ enum: DISCORD_PROBLEMS, nullable: true, description: 'Why the bot cannot post right now' }) problem: DiscordProblem | null;
}

export class DiscordStatusDto {
    @ApiProperty({ description: 'Bot credentials are set on the server' }) configured: boolean;
    @ApiProperty({ description: 'The bot is connected to Discord right now' }) botOnline: boolean;
    @ApiProperty({ type: DiscordIntegrationDto, nullable: true }) integration: DiscordIntegrationDto | null;
}

export class DiscordChannelDto {
    @ApiProperty() id: string;
    @ApiProperty() name: string;
    @ApiProperty({ nullable: true }) category: string | null;
    @ApiProperty({ description: 'The bot can view, post, and embed links here' }) canPost: boolean;
}
