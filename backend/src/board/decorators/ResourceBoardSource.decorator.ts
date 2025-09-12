import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const RESOURCE_BOARD_SOURCE = 'RESOURCE_BOARD_SOURCE';

export type ResourceBoardSource = 'params' | 'body' | 'query' | 'header';

export type ResourceBoardSourceOption = {
    source: ResourceBoardSource;
    key: string; // the key in the source to get the board id
}

export const CheckResourceBoardSource = (option: ResourceBoardSourceOption) =>
    SetMetadata(RESOURCE_BOARD_SOURCE, option);

export const getSourceAndKey = (reflector: Reflector, context: ExecutionContext) =>  {
    const data = reflector.get<{ source: ResourceBoardSource, key: string }>(RESOURCE_BOARD_SOURCE, context.getHandler());

    if(!data) {
        throw new Error('CheckResourceBoardSource metadata is not set on the handler');
    }

    return { source: data.source, key: data.key };
}