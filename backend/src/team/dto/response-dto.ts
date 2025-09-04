import { OmitType } from "@nestjs/mapped-types";
import { Expose, Transform } from "class-transformer";
import { TeamMemberRole } from "../constant/role";


export class TeamMemberType {
    @Expose()
    // this is applied because mongoose ObjectId is being changed to another id 
    // reference: https://github.com/typestack/class-transformer/issues/991#issuecomment-1028303186
    @Transform((value) => value.obj._id.toString())
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