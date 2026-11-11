import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectSchema } from 'src/schema/Project.schema';
import { TeamModule } from 'src/team/team.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectAccessGuard } from './guards/ProjectAccessGuard';
import { ProjectAdminAccessGuard } from './guards/ProjectAdminAccessGuard';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { ProjectDataService } from './project-data.service';
import { Attachment, attachmentSchema } from 'src/schema/Attachment.schema';
import { Board, boardSchema } from 'src/schema/Board.schema';
import { Column, columnSchema } from 'src/schema/Column.schema';
import { Comment, commentSchema } from 'src/schema/Comment.schema';
import { DiscordIntegration, discordIntegrationSchema } from 'src/schema/DiscordIntegration.schema';
import { Note, noteSchema } from 'src/schema/Note.schema';
import { NoteVersion, noteVersionSchema } from 'src/schema/NoteVersion.schema';
import { Task, taskSchema } from 'src/schema/Task.schema';
import { TeamMember, teamMemberSchema } from 'src/schema/TeamMember.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: projectSchema },
      // Read for live task counts, and cleared when a project is deleted.
      { name: Board.name, schema: boardSchema },
      { name: Column.name, schema: columnSchema },
      { name: Task.name, schema: taskSchema },
      { name: Comment.name, schema: commentSchema },
      { name: Attachment.name, schema: attachmentSchema },
      { name: Note.name, schema: noteSchema },
      { name: NoteVersion.name, schema: noteVersionSchema },
      { name: TeamMember.name, schema: teamMemberSchema },
      { name: DiscordIntegration.name, schema: discordIntegrationSchema },
    ]),
    forwardRef(() => TeamModule),
    AuditLogModule
  ],
  providers: [ProjectsService, ProjectDataService, ProjectAccessGuard, ProjectAdminAccessGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService]
})
export class ProjectsModule {}
