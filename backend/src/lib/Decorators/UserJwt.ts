import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserDocument } from "src/schema/User.schema";

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as UserJwt;
    }
)

export type UserJwt = {
    id: string;
    username: UserDocument['username'];
    email: UserDocument['email'];
    displayName: UserDocument['displayName'];
    avatarUrl: UserDocument['avatarUrl'];
}