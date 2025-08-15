import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";


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
    avatarUrl: string;
}

export class TeamMemberWithUser extends TeamMemberType {
    @Transform(
        ({ obj }) => plainToInstance(TeamMemberUser, obj.userId, { excludeExtraneousValues: true }) 
        ? obj.userId : null
    )
    @Expose()
    user: TeamMemberUser;

    @Exclude()
    userId: string;
}