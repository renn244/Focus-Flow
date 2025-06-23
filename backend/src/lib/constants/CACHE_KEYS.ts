import { Types } from "mongoose";

export const CACHE_KEYS = {
    userAuth: (userId: Types.ObjectId | string) => `userAuth:${userId.toString()}`, 
}