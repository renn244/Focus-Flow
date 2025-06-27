import { Types } from "mongoose";


export class CreateVerifyTokenDto {
    email: string;
    userId: Types.ObjectId;
    token?: string;
    expiresAt?: Date;
}