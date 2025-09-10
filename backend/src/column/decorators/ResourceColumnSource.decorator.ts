import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const RESOURCE_COLUMN_SOURCE = 'RESOURCE_COLUMN_SOURCE';

export type ResourceColumnSource = 'params' | 'body' | 'query' | 'header';

export type ResourceColumnSourceOption = {
    source: ResourceColumnSource;
    key: string; // the key in the source to get the column id
}

export const CheckResourceColumnSource = (option: ResourceColumnSourceOption) =>
    SetMetadata(RESOURCE_COLUMN_SOURCE, option);

export const getSourceAndKey = (reflector: Reflector, context: ExecutionContext) =>  {
    const data = reflector.get<{ source: ResourceColumnSource, key: string }>(RESOURCE_COLUMN_SOURCE, context.getHandler());

    if(!data) {
        throw new Error('CheckResourceColumnSource metadata is not set on the handler');
    }

    return { source: data.source, key: data.key };
}