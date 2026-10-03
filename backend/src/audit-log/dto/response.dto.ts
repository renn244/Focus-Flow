import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { AuditAction, AuditEntityType } from 'src/schema/AuditLog.schema';

class AuditChangeDto {
    @ApiProperty()
    @Expose()
    field: string;

    @ApiPropertyOptional()
    @Expose()
    from?: string;

    @ApiPropertyOptional()
    @Expose()
    to?: string;
}

class AuditActorDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiPropertyOptional()
    @Expose()
    displayName?: string;

    @ApiPropertyOptional()
    @Expose()
    avatarUrl?: string;
}

export class AuditLogDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    projectId: string;

    @ApiProperty({ enum: [
        'project.created', 'project.updated', 'project.deleted',
        'team.member_added', 'team.member_removed', 'team.member_role_updated',
        'task.created', 'task.updated', 'task.moved', 'task.deleted',
        'comment.created', 'comment.updated', 'comment.deleted',
        'attachment.uploaded', 'attachment.deleted',
    ] })
    @Expose()
    action: AuditAction;

    @ApiProperty({ enum: ['project', 'team_member', 'task', 'comment', 'attachment'] })
    @Expose()
    entityType: AuditEntityType;

    @ApiProperty()
    @Expose()
    entityId: string;

    @ApiPropertyOptional()
    @Expose()
    taskId?: string;

    @ApiProperty()
    @Expose()
    summary: string;

    @ApiProperty({ type: [String] })
    @Expose()
    changedFields: string[];

    @ApiProperty({ type: [AuditChangeDto] })
    @Expose()
    @Type(() => AuditChangeDto)
    changes: AuditChangeDto[];

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty({ type: AuditActorDto })
    @Expose()
    @Type(() => AuditActorDto)
    @Transform(({ obj }) => obj.actorId)
    actor: AuditActorDto;
}

export class ProjectActivityPageDto {
    @ApiProperty({ type: [AuditLogDto] })
    items: AuditLogDto[];

    @ApiPropertyOptional({ nullable: true })
    nextCursor: string | null;
}
