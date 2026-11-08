import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { AuditLog, auditLogSchema } from 'src/schema/AuditLog.schema';
import { Board, boardSchema } from 'src/schema/Board.schema';
import { Column, columnSchema } from 'src/schema/Column.schema';
import { DiscordIntegration, discordIntegrationSchema } from 'src/schema/DiscordIntegration.schema';
import { Note, noteSchema } from 'src/schema/Note.schema';
import { Project, projectSchema } from 'src/schema/Project.schema';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { User, userSchema } from 'src/schema/User.schema';
import { DiscordClientService } from './discord-client.service';
import { DiscordIntegrationService } from './discord-integration.service';
import { DiscordNotifierService } from './discord-notifier.service';
import { DiscordController } from './discord.controller';

/** The FocusFlow Discord bot: connecting projects to servers and posting their updates. */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DiscordIntegration.name, schema: discordIntegrationSchema },
            { name: AuditLog.name, schema: auditLogSchema },
            { name: Task.name, schema: taskSchema },
            { name: Board.name, schema: boardSchema },
            { name: Column.name, schema: columnSchema },
            { name: Note.name, schema: noteSchema },
            { name: Project.name, schema: projectSchema },
            { name: User.name, schema: userSchema },
        ]),
        AuditLogModule,
    ],
    controllers: [DiscordController],
    providers: [DiscordClientService, DiscordIntegrationService, DiscordNotifierService],
})
export class DiscordModule {}
