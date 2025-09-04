import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cache } from "cache-manager";
import { Model, Types } from "mongoose";
import { TeamMember, TeamMemberDocument } from "src/schema/TeamMember.schema";
import { TeamMemberWithUser } from "./dto/response-dto";
import { CACHE_KEYS } from "src/lib/constants/CACHE_KEYS";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TeamSharedService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMemberDocument>,
    ) {}

    async getMembers(projectId: Types.ObjectId) {
        let members = await this.cacheManager.get<TeamMemberWithUser[]>(CACHE_KEYS.teamMemberProjects(projectId.toString()));

        if (!members) {
            const teamMembers = await this.teamMemberModel.find({ projectId: projectId.toString() })
                .populate('userId', '_id username email displayName avatarUrl');

            members = plainToInstance(TeamMemberWithUser, teamMembers, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            });

            await this.cacheManager.set(CACHE_KEYS.teamMemberProjects(projectId.toString()), members);
        }

        return members;
    }
    
}