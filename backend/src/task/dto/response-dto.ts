import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform } from 'class-transformer';

export class TaskDto {
    @ApiProperty()
    @Expose()
    _id: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiPropertyOptional()
    @Expose()
    description?: string;

    @ApiProperty({ enum: ['low', 'medium', 'high'] })
    @Expose()
    priority: 'low' | 'medium' | 'high';

    @ApiProperty()
    @Expose()
    boardId: string;

    @ApiProperty()
    @Expose()
    columnId: string;

    @ApiPropertyOptional({ format: 'date-time' })
    @Expose()
    dueDate?: string;

    @ApiPropertyOptional({ type: [String] })
    @Expose()
    tags?: string[];

    @ApiPropertyOptional()
    @Expose()
    @Transform(({ value }) => value?._id?.toString?.() ?? value?.toString?.())
    assignee?: string;

    @ApiPropertyOptional()
    @Expose()
    order?: number;

    @ApiProperty({ format: 'date-time' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ format: 'date-time' })
    @Expose()
    updatedAt: Date;
}

class ColumnDto {
    @ApiProperty()
    @Transform((value) => value.obj._id.toString())
    @Expose()
    _id: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    color: string;
}

class BoardDto {
    @ApiProperty()
    @Transform((value) => value.obj._id.toString())
    @Expose()
    _id: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value?.toString())
    projectId: string;
}

class AssigneeDto {
    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    _id: string;

    @ApiProperty()
    @Expose()
    displayName: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiPropertyOptional()
    @Expose()
    avatarUrl?: string;
}

export class TaskWithBoardAndColumnDto extends TaskDto {
    @ApiProperty({ type: ColumnDto })
    @Expose()
    @Transform(({ obj }) => plainToInstance(ColumnDto, obj.columnId, { excludeExtraneousValues: true }))
    column: ColumnDto;

    @ApiProperty({ type: BoardDto })
    @Expose()
    @Transform(({ obj }) => plainToInstance(BoardDto, obj.boardId, { excludeExtraneousValues: true }))
    board: BoardDto;

    @ApiPropertyOptional({ type: AssigneeDto })
    @Expose()
    @Transform(({ obj }) => obj.assignee && typeof obj.assignee === 'object'
        ? plainToInstance(AssigneeDto, obj.assignee, { excludeExtraneousValues: true })
        : undefined)
    assigneeUser?: AssigneeDto;
}
