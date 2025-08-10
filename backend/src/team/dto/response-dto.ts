import { OmitType } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";


export class TeamMemberType {
    @Expose()
    _id: string;

    @Expose()
    userId: string;

    @Expose()
    projectId: string;

    @Expose()
    role: 'admin' | 'member';

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
    avatarUrl: Date;
}

export class TeamMemberWithUser extends OmitType(TeamMemberType, ['userId']) {
    @Transform(({ obj }) => obj.userId ? obj.userId : null)
    @Expose()
    user: TeamMemberUser;
}