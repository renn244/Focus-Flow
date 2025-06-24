import { Profile, Strategy } from "passport-github2";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
            scope: ['read:user', 'user:email', 'repo', 'public_repo']
        })
    }

    async validate(
        accessToken: string, refreshToken: string, 
        profile: Profile, done: any 
    ) {
        done(null, profile)
    }
} 