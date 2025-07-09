import { Expose, plainToInstance, Transform } from "class-transformer";
import { Types } from "mongoose";
import { ColumnDto } from "src/column/dto/response-dto";

export class BoardDto {
    @Expose()
    _id: string;

    @Expose()
    name: string;
    
    @Expose()
    projectId: string;

    @Expose()
    columns: any[]; // Assuming columns is an array of objects

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}

export class BoardWithColumnsDto {
    @Expose()
    @Transform(({ obj }) => 
        obj.columns ? plainToInstance(ColumnDto, obj.columns, { excludeExtraneousValues: true }) : []
    )
    columns: ColumnDto[];
}