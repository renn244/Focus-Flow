import ACTION from "../constants/action.constants";
import RESOURCE_TYPE from "../constants/resourcesType.cosntants";

export type ActionType = typeof ACTION[keyof typeof ACTION];
export type ResourceType_Type = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];