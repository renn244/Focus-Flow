import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectSchema } from 'src/schema/Project.schema';
import { TeamModule } from 'src/team/team.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: projectSchema
      }
    ]),
    forwardRef(() => TeamModule)
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService]
})
export class ProjectsModule {}
