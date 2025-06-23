import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/lib/guards/LocalAuthGuard';
import { AuthService } from './auth.service';
import { LocalSignUpDto } from './dto/LocalSignUp.dto';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('local/login')
    async localLogin(@Request() req: any) {
        return this.authService.login(req.user);
    }

    @Post('local/signup')
    async localSignUp(@Body() body: LocalSignUpDto) {
        return this.authService.localSignUp(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('check')
    async checkAuth(@User() user: UserJwt) {
        return this.authService.checkAuth(user);
    }
}
