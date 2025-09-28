import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const RESOURCE_TASK_SOURCE = 'RESOURCE_TASK_SOURCE';

export type ResourceTaskSource = 'params' | 'body' | 'query' | 'header';

export type ResourceTaskSourceOption = {
    source: ResourceTaskSource;
    key: string; // the key in the source to get the task id
}

export const CheckResourceTaskSource = (option: ResourceTaskSourceOption) =>
    SetMetadata(RESOURCE_TASK_SOURCE, option);

export const getSourceAndKey = (reflector: Reflector, context: ExecutionContext) =>  {
    const data = reflector.get<{ source: ResourceTaskSource, key: string }>(RESOURCE_TASK_SOURCE, context.getHandler());
    
    if(!data) {
        throw new Error('CheckResourceTaskSource metadata is not set on the handler');
    }
 
    return { source: data.source, key: data.key };
}