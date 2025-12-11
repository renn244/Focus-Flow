import ACTION from "../constant/action.constant";
import RESOURCE_TYPE from "../constant/resourcesType.constant";

export type ActionType = typeof ACTION[keyof typeof ACTION];
export type ResourceType_Type = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];