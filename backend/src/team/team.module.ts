import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { ProjectsModule } from 'src/projects/projects.module';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember, teamMemberSchema } from 'src/schema/TeamMember.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TeamMember.name,
        schema: teamMemberSchema
      }
    ]),
    ProjectsModule, UserModule
  ],
  providers: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}
