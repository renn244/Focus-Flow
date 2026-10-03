import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { TeamSharedService } from './team.shared.service';
import { TeamGateway } from './team.gateway';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { GetTeamMembersTableQueryDto, TeamMemberTableSortField } from './dto/get-team-members-table-query.dto';

@Injectable()
export class TeamService {
    constructor(
        @Inject(forwardRef(() => ProjectsService)) private readonly projectService: ProjectsService,
        private readonly userService: UserService,
        private readonly teamSharedService: TeamSharedService,
        private readonly teamGateway: TeamGateway,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMemberDocument>,
        @InjectConnection() private readonly connection: Connection,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getProjectIdsByMemberId(userId: Types.ObjectId) {
        const teamMembers = await this.teamMemberModel.find({ userId: userId.toString() });
        return teamMembers.map(member => member.projectId);
    }

    async getMember(projectId: string, memberId: string) {
        const member = await this.teamMemberModel.findOne({ 
            projectId: projectId, _id: memberId,
        }).populate('userId', 'username email displayName avatarUrl');

        if(!member) {
            throw new NotFoundException('Team member not found');
        }

        const projectMembers = await this.teamSharedService.getMembers(new Types.ObjectId(projectId));

        if(!projectMembers.find((member) => member._id.toString() === memberId.toString())) {
            throw new BadRequestException('Member not a member of the project');
        }

        return plainToInstance(TeamMemberWithUser, member, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async getMembers(projectId: Types.ObjectId) {
        return this.teamSharedService.getMembers(projectId);
    }

    async getMembersTable(user: UserJwt, projectId: Types.ObjectId, query: GetTeamMembersTableQueryDto) {
        const isMember = await this.teamSharedService.isUserMemberInProject(projectId, user.id);

        if (!isMember) {
            throw new ForbiddenException('User is not a member of this project');
        }

        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const sortBy = query.sortBy ?? 'member';
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
        const search = query.search?.trim();

        const sortFields: Record<TeamMemberTableSortField, string> = {
            member: 'user.displayName',
            role: 'roleRank',
            email: 'user.email',
            joined: 'joinedAt',
        };

        const memberSearch = search
            ? {
                $match: {
                    $or: ['displayName', 'username', 'email'].map((field) => ({
                        [`user.${field}`]: { $regex: this.escapeRegex(search), $options: 'i' },
                    })),
                },
            }
            : null;

        const [result] = await this.teamMemberModel.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $toString: '$projectId' }, projectId.toString()],
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { teamUserId: { $toString: '$userId' } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [{ $toString: '$_id' }, '$$teamUserId'],
                                },
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            ...(memberSearch ? [memberSearch] : []),
            {
                $addFields: {
                    roleRank: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$role', 'owner'] }, then: 0 },
                                { case: { $eq: ['$role', 'admin'] }, then: 1 },
                                { case: { $eq: ['$role', 'member'] }, then: 2 },
                            ],
                            default: 3,
                        },
                    },
                },
            },
            {
                $facet: {
                    items: [
                        { $sort: { [sortFields[sortBy]]: sortOrder, 'user.username': sortOrder, _id: sortOrder } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                projectId: 1,
                                role: 1,
                                joinedAt: 1,
                                user: {
                                    _id: '$user._id',
                                    username: '$user.username',
                                    email: '$user.email',
                                    displayName: '$user.displayName',
                                    avatarUrl: '$user.avatarUrl',
                                },
                            },
                        },
                    ],
                    metadata: [{ $count: 'total' }],
                },
            },
        ]).exec();

        const total = result?.metadata[0]?.total ?? 0;

        return {
            items: result?.items ?? [],
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    private escapeRegex(value: string) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async getActiveMembers(projectId: Types.ObjectId) {
        const members = await this.teamSharedService.getMembers(projectId);
        const activeMembersIds = this.teamGateway.getUserIdsInProject(projectId.toString())

        const activeMembers = members
            .filter(member => activeMembersIds.includes(member.user._id.toString()))
            .map(member => member.user);

        return activeMembers
    }

    async getUserInfo(userId: string, projectId: string) {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const membersUserId = (await this.teamSharedService.getMembers(new Types.ObjectId(projectId)))
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

        const projectMembersId = (await this.teamSharedService.getMembers(new Types.ObjectId(projectId)))
            .map(member => member.user._id.toString());


        const filteredUsers = users.filter(
            u => !projectMembersId.includes(u._id.toString()) && u._id.toString() !== user.id.toString()
        );

        return plainToInstance(TeamMemberUser, filteredUsers, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        })
    }

    async validateTeamMemberInProject(teamMemberId: string, projectId: Types.ObjectId) {
        const teamMember = await this.teamMemberModel.exists({ _id: teamMemberId, projectId: projectId.toString() });
        return !!teamMember;
    }
 
    // check if the user has the permission to add the member in guard maybe
    async addMember(user: UserJwt, body: AddMemberDto, recordAudit = true) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const projectMembersId = (await this.teamSharedService.getMembers(new Types.ObjectId(body.projectId)))
                .map(member => member.user._id.toString());

            if (projectMembersId.includes(body.userId)) {
                throw new BadRequestException('User is already a member of the project');
            }

            const teamMember = await this.teamMemberModel.create([body], { session });

            await this.projectService.addMemberToProject(new Types.ObjectId(body.projectId), teamMember[0]._id, session);
            await this.userService.addProjectToUser(new Types.ObjectId(body.userId), teamMember[0]._id, session);
            const teamMemberWithUser = await teamMember[0].populate<{ userId: { username: string, email: string, displayName: string, avatarUrl: string } }>('userId', 'username email displayName avatarUrl');

            await session.commitTransaction();
            
            this.teamGateway.io.to(body.projectId).emit('memberAdded',
                plainToInstance(TeamMemberWithUser, teamMemberWithUser, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                }),
            )
            await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(body.projectId)));

            if (recordAudit) {
                await this.auditLogService.record({
                    projectId: body.projectId,
                    actorId: user.id,
                    action: 'team.member_added',
                    entityType: 'team_member',
                    entityId: teamMember[0]._id,
                    summary: 'Added a member to the project',
                });
            }

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
            const projectMembersId = (await this.teamSharedService.getMembers(new Types.ObjectId(body.projectId)))
                .map(member => member.user._id.toString());
            
            if (!projectMembersId.includes(body.userId)) {
                throw new NotFoundException('User is not a member of the project');
            }

            const teamMember = await this.teamMemberModel.findOneAndDelete(
                { projectId: body.projectId, userId: body.userId}, { session }
            ).populate<{ userId: { 
                username: string, email: string, displayName: string, avatarUrl: string 
            } }>('userId', 'username email displayName avatarUrl');

            if(!teamMember) {
                throw new NotFoundException('Team member not found');
            }

            await this.projectService.removeMemberFromProject(new Types.ObjectId(body.projectId), teamMember._id, session);
            await this.userService.removeProjectFromUser(new Types.ObjectId(body.userId), teamMember._id, session);

            await session.commitTransaction();

            this.teamGateway.io.to(body.projectId).emit('memberRemoved', 
                plainToInstance(TeamMemberWithUser, teamMember, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true,
                }),
            );
            await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(body.projectId)));

            await this.auditLogService.record({
                projectId: body.projectId,
                actorId: user.id,
                action: 'team.member_removed',
                entityType: 'team_member',
                entityId: teamMember._id,
                summary: 'Removed a member from the project',
            });

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
        ).populate<{ userId: { username: string, email: string, displayName: string, avatarUrl: string } }>('userId', 'username email displayName avatarUrl');

        if(!updatedTeamMember) {
            throw new NotFoundException('Team member not found');
        }

        this.teamGateway.io.to(updatedTeamMember.projectId.toString()).emit('memberUpdated',
            plainToInstance(TeamMemberWithUser, updatedTeamMember, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }),
        );
        await this.cacheManager.del(CACHE_KEYS.teamMemberProjects(new Types.ObjectId(updatedTeamMember.projectId)));
        await this.auditLogService.record({
            projectId: updatedTeamMember.projectId,
            actorId: user.id,
            action: 'team.member_role_updated',
            entityType: 'team_member',
            entityId: updatedTeamMember._id,
            summary: 'Updated a team member role',
            changedFields: ['role'],
        });
        return plainToInstance(TeamMemberWithUser, updatedTeamMember, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
        });
    }
}
