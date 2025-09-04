import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from 'src/projects/projects.module';
import { TeamMember, teamMemberSchema } from 'src/schema/TeamMember.schema';
import { UserModule } from 'src/user/user.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamGateway } from './team.gateway';
import { TeamSharedService } from './team.shared.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TeamMember.name,
        schema: teamMemberSchema
      }
    ]),
    forwardRef(() => ProjectsModule), 
    UserModule
  ],
  providers: [TeamSharedService, TeamService, TeamGateway],
  controllers: [TeamController],
  exports: [TeamService, TeamGateway]
})
export class TeamModule {}
