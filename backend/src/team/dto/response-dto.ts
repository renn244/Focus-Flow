import { OmitType } from "@nestjs/mapped-types";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { TeamMemberRole } from "../constant/role";


export class TeamMemberType {
    @Expose()
    _id: string;

    @Expose()
    userId: string;

    @Expose()
    projectId: string;

    @Expose()
    role: TeamMemberRole;

    @Expose()
    joinedAt: Date
}

export class TeamMemberUser {
    @Expose()
    _id: string;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    displayName: string;

    @Expose()
    avatarUrl: string;
}

export class TeamMemberWithUser extends OmitType(TeamMemberType, ['userId'] as const) {
    @Transform(
        ({ obj }) => obj.userId ? obj.userId : null
    )
    @Expose()
    user: TeamMemberUser;
}