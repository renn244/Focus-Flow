import { OmitType } from "@nestjs/mapped-types";
import { Expose, Transform } from "class-transformer";
import { TeamMemberRole } from "../constant/role";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class TeamMemberType {
    @ApiProperty()
    @Expose()
    // this is applied because mongoose ObjectId is being changed to another id 
    // reference: https://github.com/typestack/class-transformer/issues/991#issuecomment-1028303186
    @Transform((value) => value.obj._id.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    userId: string;

    @ApiProperty()
    @Expose()
    projectId: string;

    @ApiProperty({ enum: ['owner', 'admin', 'member'] })
    @Expose()
    role: TeamMemberRole;

    @ApiProperty()
    @Expose()
    joinedAt: Date
}

export class TeamMemberUser {
    @ApiProperty()
    @Expose()
    _id: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    displayName: string;

    @ApiPropertyOptional()
    @Expose()
    avatarUrl: string;
}

export class TeamMemberWithUser extends OmitType(TeamMemberType, ['userId'] as const) {
    @ApiProperty({ type: TeamMemberUser })
    @Transform(
        ({ obj }) => obj.userId ? obj.userId : null
    )
    @Expose()
    user: TeamMemberUser;
}

export class TeamMemberTablePageDto {
    @ApiProperty({ type: [TeamMemberWithUser] })
    items: TeamMemberWithUser[];

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 24 })
    total: number;

    @ApiProperty({ example: 3 })
    totalPages: number;
}
