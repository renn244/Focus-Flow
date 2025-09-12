import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const RESOURCE_PROJECT_SOURCE = 'RESOURCE_PROJECT_SOURCE';

export type ResourceProjectSource = 'params' | 'body' | 'query' | 'header';

export type ResourceProjectSourceOption = {
    source: ResourceProjectSource;
    key: string; // the key in the source to get the project id
}

export const CheckResourceProjectSource = (option: ResourceProjectSourceOption) =>
    SetMetadata(RESOURCE_PROJECT_SOURCE, option);

export const getSourceAndKey = (reflector: Reflector, context: ExecutionContext) => {
    const data = reflector.get<{ source: ResourceProjectSource, key: string }>(RESOURCE_PROJECT_SOURCE, context.getHandler());

    if(!data) {
        throw new Error('CheckResourceProjectSource metadata is not set on the handler');
    }

    return { source: data.source, key: data.key };
}