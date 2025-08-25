import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { Connection, Model, Types } from 'mongoose';
import { CACHE_KEYS } from 'src/lib/constants/CACHE_KEYS';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { ProjectsService } from 'src/projects/projects.service';
import { TeamMember, TeamMemberDocument } from 'src/schema/TeamMember.schema';
import { UserService } from 'src/user/user.service';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { TeamMemberType, TeamMemberUser, TeamMemberWithUser } from './dto/response-dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class TeamService {
    constructor(
        @Inject(forwardRef(() => ProjectsService)) private readonly projectService: ProjectsService,
        private readonly userService: UserService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMemberDocument>,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async getProjectIdsByMemberId(userId: Types.ObjectId) {
        const teamMembers = await this.teamMemberModel.find({ userId: userId.toString() });
        return teamMembers.map(member => member.projectId);
    }

    async getMembers(projectId: Types.ObjectId) {
        let members = await this.cacheManager.get<any[]>(CACHE_KEYS.teamMemberProjects(projectId.toString()));

        if (!members) {
            const teamMembers = await this.teamMemberModel.find({ projectId: projectId.toString() })
                .populate('userId', 'username email displayName avatarUrl');

            members = plainToInstance(TeamMemberWithUser, teamMembers, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });

            await this.cacheManager.set(CACHE_KEYS.teamMemberProjects(projectId.toString()), members);
        }

        return members;
    }

    async getMember(projectId: string, memberId: string) {
        const member = await this.teamMemberModel.findOne({ 
            projectId: projectId, _id: memberId,
        }).populate('userId', 'username email displayName avatarUrl');

        if(!member) {
            throw new NotFoundException('Team member not found');
        }

        const projectMembers = await this.getMembers(new Types.ObjectId(projectId));

        if(!projectMembers.find((member) => member._id.toString() === memberId.toString())) {
            throw new BadRequestException('Member not a member of the project');
        }

        return plainToInstance(TeamMemberWithUser, member, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async getUserInfo(userId: string, projectId: string) {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const membersUserId = (await this.getMembers(new Types.ObjectId(projectId)))
            .map(members => members.user._id.toString());

        if(membersUserId.includes(user._id.toString())) {
            throw new BadRequestException('User is already a member')
        }

        return plainToInstance(TeamMemberUser, user, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }

    async searchUser(query: string, projectId: string, user: UserJwt) {
        const users = await this.userService.findManyByUsernameOrEmail(query);

        const projectMembersId = (await this.getMembers(new Types.ObjectId(projectId)))
            .map(member => member.user._id.toString());


        const filteredUsers = users.filter(
            u => !projectMembersId.includes(u._id.toString()) && u._id.toString() !== user.id.toString()
        );

        return plainToInstance(TeamMemberUser, filteredUsers, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    // check if the user has the permission to add the member in guard maybe
    async addMember(user: UserJwt, body: AddMemberDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const projectMembersId = (await this.getMembers(new Types.ObjectId(body.projectId)))
                .map(member => member.user._id.toString());

            if (projectMembersId.includes(body.userId)) {
                throw new BadRequestException('User is already a member of the project');
            }

            const teamMember = await this.teamMemberModel.create([body], { session });

            await this.projectService.addMemberToProject(new Types.ObjectId(body.projectId), teamMember[0]._id, session);
            await this.userService.addProjectToUser(new Types.ObjectId(body.userId), teamMember[0]._id, session);
            const teamMemberWithUser = await teamMember[0].populate('userId', 'username email displayName avatarUrl');

            await session.commitTransaction();

            await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(body.projectId)));

            return plainToInstance(TeamMemberWithUser, teamMemberWithUser, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // check if the user has the permission to remove the member in guard maybe
    async removeMember(user: UserJwt, body: RemoveMemberDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const projectMembersId = (await this.getMembers(new Types.ObjectId(body.projectId)))
                .map(member => member.user._id.toString());
            
            if (!projectMembersId.includes(body.userId)) {
                throw new NotFoundException('User is not a member of the project');
            }

            const teamMember = await this.teamMemberModel.findOneAndDelete(
                { projectId: body.projectId, userId: body.userId}, { session }
            );

            if(!teamMember) {
                throw new NotFoundException('Team member not found');
            }

            await this.projectService.removeMemberFromProject(new Types.ObjectId(body.projectId), teamMember._id, session);
            await this.userService.removeProjectFromUser(new Types.ObjectId(body.userId), teamMember._id, session);
       
            await session.commitTransaction();

            await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(body.projectId)));

            return plainToInstance(TeamMemberType, teamMember, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // make sure the user has the proper authorization to update the role
    async updateRole(user: UserJwt, memberId: Types.ObjectId, body: UpdateRoleDto) {
        const updatedTeamMember = await this.teamMemberModel.findOneAndUpdate(
            { _id: memberId }, { role: body.newRole }, { new: true }
        ).populate('userId', 'username email displayName avatarUrl');

        if(!updatedTeamMember) {
            throw new NotFoundException('Team member not found');
        }

        await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(updatedTeamMember.projectId)));

        return plainToInstance(TeamMemberWithUser, updatedTeamMember, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
