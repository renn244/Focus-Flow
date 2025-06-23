import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LocalSignUpDto } from './dto/LocalSignUp.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/schema/User.schema';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEYS } from 'src/lib/constants/CACHE_KEYS';

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

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            throw new BadRequestException('password is incorrect');
        }

        return user;
    }

    async localSignUp(body: LocalSignUpDto) {
        const { username, email, password, confirmPassword } = body;

        const existingUser = await this.userService.findByUsernameOrEmail(username, email);

        if (existingUser) {
            throw new BadRequestException('Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.userService.create({ username, email, password: hashedPassword, displayName: username })

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
