import { Body, Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/lib/guards/LocalAuthGuard';
import { AuthService } from './auth.service';
import { LocalSignUpDto } from './dto/LocalSignUp.dto';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { GithubAuthGuard } from 'src/lib/guards/GithubAuthGuard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
    ) {}

    @UseGuards(GithubAuthGuard)
    @Get('github/login')
    async githubLogin(@Request() req: any) {}

    @UseGuards(GithubAuthGuard)
    @Get('github/callback-url')
    async githubCallback(@Request() req: any, @Response() res: any) {
        const token = await this.authService.validateGithubUser(req.user as any);

        return res.redirect(`http://localhost:5173/redirect-token?access_token=${token?.access_token}`)
    }

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
