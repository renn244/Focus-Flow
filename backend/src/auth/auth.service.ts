import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { Profile } from 'passport-github2';
import { CACHE_KEYS } from 'src/lib/constants/CACHE_KEYS';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { UserDocument } from 'src/schema/User.schema';
import { UserService } from 'src/user/user.service';
import { LocalSignUpDto } from './dto/LocalSignUp.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async validateLocalUser(username: string, password: string) {
        const user = await this.userService.findByUsername(username);

        if(!user) {
            throw new BadRequestException('username does not exist');
        }

        if(!user.password || user.isOauthUser) {
            throw new BadRequestException('user is using a Oauth Provider');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            throw new BadRequestException('password is incorrect');
        }

        return user;
    }

    async localSignUp(body: LocalSignUpDto) {
        const { username, email, password, confirmPassword } = body;

        // const existingUser = await this.userService.findByUsernameOrEmail(username, email);

        // if (existingUser) {
        //     throw new BadRequestException('Username or email already exists');
        // }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.userService.create({ 
            username, email, password: hashedPassword, displayName: username, isOauthUser: false
        })

        if (!newUser) {
            throw new BadRequestException('Failed to create user');
        }

        return {
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                displayName: newUser.displayName
            }
        }
    }

    async validateGithubUser(profile: Profile) {
        try {
            const { id } = profile;

            let user = await this.userService.findByOauthId(id);
            if(!user) {
                const { username, emails, displayName, profileUrl } = profile;
                const email = emails?.[0]?.value || '';

                // should catch any error and return a message instead to be put on the url search params
                user = await this.userService.create({
                    username: username || displayName, email, displayName: displayName,
                    avatarUrl: profileUrl, OauthId: id, isOauthUser: true
                })

                if (!user) {
                    throw new BadRequestException('Failed to create user with GitHub profile');
                }
            }

            return this.login(user);
        } catch(error: any) {
        }
    }

    async login(user: UserDocument) {
        const payload = { 
            id: user._id, username: user.username, email: user.email,
            displayName: user.displayName, avatarUrl: user.avatarUrl 
        };

        return {
            accessToken: this.jwtService.sign(payload),
        }
    }

    async checkAuth(user: UserJwt) {
        let cacheUser = await this.cacheManager.get<any>(CACHE_KEYS.userAuth(user.id));

        if(!cacheUser) {
            cacheUser = await this.userService.findById(user.id, { select: '-password' })

            this.cacheManager.set(CACHE_KEYS.userAuth(user.id.toString()), cacheUser)
        }
        
        return cacheUser
    }
}
