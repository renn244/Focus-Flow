import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UserDocument } from "src/schema/User.schema";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) { 
        super({
            usernameField: 'username',
            passwordField: 'password',
        }); 
    }

    async validate(username: string, password: string): Promise<UserDocument | null> {
        const user = await this.authService.validateLocalUser(username, password);

        if(!user) {
            // this error is just extra but it is being handled already by validateLocalUser
            throw new UnauthorizedException('Invalid credetials')
        }

        return user;
    }
}