import { Body, Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/lib/guards/LocalAuthGuard';
import { AuthService } from './auth.service';
import { LocalSignUpDto } from './dto/LocalSignUp.dto';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { GithubAuthGuard } from 'src/lib/guards/GithubAuthGuard';
import { LocalLoginDto } from './dto/LocalLogin.dto';
import { ApiBearerAuth, ApiResponse, ApiServiceUnavailableResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MfaService } from './mfa.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
        private readonly mfaService: MfaService,
    ) {}

    @UseGuards(GithubAuthGuard)
    @Get('github/login')
    async githubLogin(@Request() req: any) {}

    @UseGuards(GithubAuthGuard)
    @Get('github/callback-url')
    async githubCallback(@Request() req: any, @Response() res: any) {
        const token = await this.authService.validateGithubUser(req.user as any);

        // checking if token returns token: { message }
        if('message' in token) {
            return res.redirect(`http://localhost:5173/redirect-token?error=${token.message}`);
        }

        return res.redirect(`http://localhost:5173/redirect-token?access_token=${token?.access_token}`)
    }

    @ApiUnauthorizedResponse({ description: 'Invalid credentials'})
    // add ValidationException ApiResponse for swagger later
    @ApiResponse({
        status: 200, description: 'Login successful',
        example: { access_token: '321lk1n9p2i1jn9p 1n29en1-e -1je-981h e89-h1e0921-e9h19-8e' }
    })
    @ApiBearerAuth()
    @UseGuards(LocalAuthGuard)
    @Post('local/login')
    async localLogin(@Request() req: any, @Body() body: LocalLoginDto) {
        // With two-step sign-in on, the password only earns a short-lived ticket;
        // the access token comes from /auth/mfa/verify.
        if (req.user?.mfaEnabled) return this.mfaService.startChallenge(req.user);
        return this.authService.login(req.user);
    }

    @ApiServiceUnavailableResponse({ description: 'Failed to create user' })
    // add ValidationException ApiResponse for swagger later
    @ApiResponse({
        status: 201, description: 'User created successfully',
        example: { message: 'User created successfully', email: 'john_doe@gmail.com',  }
    })
    @Post('local/signup')
    async localSignUp(@Body() body: LocalSignUpDto) {
        return this.authService.localSignUp(body);
    }

    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiResponse({
        status: 200, type: 'application/json',
        description: 'User is authenticated',
        example: { _id: '60c72b2f9b1e8c001c8e4d3a', username: 'john_doe', email: 'john_doe@gmail.com', displayName: 'John Doe'}
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('check')
    async checkAuth(@User() user: UserJwt) {
        return this.authService.checkAuth(user);
    }
}
