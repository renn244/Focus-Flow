import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectSchema } from 'src/schema/Project.schema';
import { TeamModule } from 'src/team/team.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectAccessGuard } from './guards/ProjectAccessGuard';
import { ProjectAdminAccessGuard } from './guards/ProjectAdminAccessGuard';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: projectSchema
      }
    ]),
    forwardRef(() => TeamModule),
    AuditLogModule
  ],
  providers: [ProjectsService, ProjectAccessGuard, ProjectAdminAccessGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService]
})
export class ProjectsModule {}
