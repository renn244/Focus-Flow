import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const RESOURCE_TEAM_SOURCE = 'RESOURCE_TEAM_SOURCE';

export type ResourceTeamSource = 'params' | 'body' | 'query' | 'header';

export type ResourceTeamSourceOption = {
    source: ResourceTeamSource;
    key: string; // the key in the source to get the team id
}

export const CheckResourceTeamSource = (option: ResourceTeamSourceOption) => 
    SetMetadata(RESOURCE_TEAM_SOURCE, option);

export const getSourceAndKey = (reflector: Reflector, context: ExecutionContext) => {
    const data = reflector.get<{ source: ResourceTeamSource, key: string }>(RESOURCE_TEAM_SOURCE, context.getHandler());

    if(!data) {
        throw new Error('CheckResourceTeamSource metadata is not set on the handler');
    }

    return { source: data.source, key: data.key };
}