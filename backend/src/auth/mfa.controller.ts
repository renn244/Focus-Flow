import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { AuthService } from './auth.service';
import {
  MfaCodeDto,
  MfaDisableDto,
  MfaTicketDto,
  MfaVerifyDto,
} from './dto/mfa.dto';
import { MfaService } from './mfa.service';

@ApiTags('Two-step sign-in')
@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Finish a password login with a code from the app or email',
  })
  @HttpCode(200)
  @Post('verify')
  async verify(@Body() body: MfaVerifyDto) {
    const user = await this.mfaService.verifyChallenge(
      body.mfaToken,
      body.code,
      body.method,
    );
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Email a one-time sign-in code' })
  @HttpCode(200)
  @Post('email')
  async email(@Body() body: MfaTicketDto) {
    return this.mfaService.sendEmailCode(body.mfaToken);
  }

  @ApiOperation({
    summary: 'Start setup: returns a QR code for an authenticator app',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('setup')
  async setup(@User() user: UserJwt) {
    return this.mfaService.beginSetup(user.id.toString());
  }

  @ApiOperation({ summary: 'Confirm setup with the first code from the app' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('enable')
  async enable(@User() user: UserJwt, @Body() body: MfaCodeDto) {
    return this.mfaService.confirmSetup(user.id.toString(), body.code);
  }

  @ApiOperation({
    summary: 'Turn two-step sign-in off (asks for the password)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('disable')
  async disable(@User() user: UserJwt, @Body() body: MfaDisableDto) {
    return this.mfaService.disable(user.id.toString(), body.password);
  }
}
