import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { createHash, randomInt, randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { EmailService } from 'src/email/email.service';
import { CACHE_KEYS } from 'src/lib/constants/CACHE_KEYS';
import { User, UserDocument } from 'src/schema/User.schema';

export type MfaMethod = 'authenticator' | 'email';

/** How long the password-checked ticket stays valid before the person must sign in again. */
const TICKET_TTL = '5m';
const MAX_ATTEMPTS = 5;
const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const EMAIL_COOLDOWN_MS = 30 * 1000;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

// Accept the code from the previous or next 30-second step as well, for clock drift.
authenticator.options = { window: 1 };

class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

/** "alex@example.com" -> "a•••@example.com" */
export const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(name.length - 1, 5)))}@${domain}`;
};

type TicketPayload = { sub: string; purpose: 'mfa'; jti: string };

@Injectable()
export class MfaService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * The ticket is signed with its own secret, so it can never be used as a
   * normal access token by the JWT guard.
   */
  private get ticketSecret() {
    return `${this.configService.get<string>('JWT_SECRET')}:mfa-ticket`;
  }

  /** Called after the password checked out, for an account with two-step sign-in on. */
  startChallenge(user: UserDocument) {
    const mfaToken = this.jwtService.sign(
      { sub: user._id.toString(), purpose: 'mfa', jti: randomUUID() },
      { secret: this.ticketSecret, expiresIn: TICKET_TTL },
    );
    return {
      mfaRequired: true as const,
      mfaToken,
      email: maskEmail(user.email),
      methods: ['authenticator', 'email'] as MfaMethod[],
    };
  }

  private readTicket(mfaToken: string): TicketPayload {
    try {
      const payload = this.jwtService.verify<TicketPayload>(mfaToken, {
        secret: this.ticketSecret,
      });
      if (payload.purpose !== 'mfa') throw new Error('wrong purpose');
      return payload;
    } catch {
      throw new UnauthorizedException(
        'Your sign-in step expired. Enter your username and password again.',
      );
    }
  }

  /** Checks the code and returns the user it belongs to. Limited to a few tries per ticket. */
  async verifyChallenge(mfaToken: string, code: string, method: MfaMethod) {
    const ticket = this.readTicket(mfaToken);

    if (await this.cache.get(`mfaUsed:${ticket.jti}`)) {
      throw new UnauthorizedException(
        'This sign-in step was already used. Sign in again.',
      );
    }
    const attemptsKey = `mfaAttempts:${ticket.jti}`;
    const attempts = (await this.cache.get<number>(attemptsKey)) ?? 0;
    if (attempts >= MAX_ATTEMPTS) {
      throw new TooManyRequestsException(
        'Too many wrong codes. Sign in again to get a new chance.',
      );
    }

    const user = await this.userModel.findById(ticket.sub).select('+mfaSecret');
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException(
        'Two-step sign-in is not set up for this account.',
      );
    }

    const cleanCode = code.replace(/\s/g, '');
    let valid = false;
    if (method === 'authenticator') {
      valid = authenticator.check(cleanCode, user.mfaSecret);
    } else {
      const stored = await this.cache.get<string>(`mfaEmailCode:${ticket.sub}`);
      valid = !!stored && stored === hash(cleanCode);
      if (valid) await this.cache.del(`mfaEmailCode:${ticket.sub}`);
    }

    if (!valid) {
      await this.cache.set(attemptsKey, attempts + 1, ATTEMPT_WINDOW_MS);
      const left = MAX_ATTEMPTS - attempts - 1;
      throw new BadRequestException(
        left > 0
          ? `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.`
          : 'Too many wrong codes. Sign in again to get a new chance.',
      );
    }

    await this.cache.set(`mfaUsed:${ticket.jti}`, true, ATTEMPT_WINDOW_MS);
    return user;
  }

  /** Emails a one-time code, as a fallback when the authenticator app isn't at hand. */
  async sendEmailCode(mfaToken: string) {
    const ticket = this.readTicket(mfaToken);
    const cooldownKey = `mfaEmailCooldown:${ticket.sub}`;
    if (await this.cache.get(cooldownKey)) {
      throw new TooManyRequestsException(
        'A code was just sent. Wait a few seconds before asking for another.',
      );
    }

    const user = await this.userModel.findById(ticket.sub);
    if (!user?.mfaEnabled)
      throw new UnauthorizedException(
        'Two-step sign-in is not set up for this account.',
      );

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: `Your FocusFlow sign-in code: ${code}`,
        template: 'mfa-code',
        context: {
          code,
          displayName: user.displayName,
          minutes: EMAIL_CODE_TTL_MS / 60000,
        },
      });
    } catch {
      // Nothing was sent, so don't start a cooldown or keep a code nobody received.
      throw new HttpException(
        "We couldn't send the email right now. Use your authenticator app, or try again later.",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Only a code that actually went out can be used, and only then does the resend wait start.
    await this.cache.set(
      `mfaEmailCode:${ticket.sub}`,
      hash(code),
      EMAIL_CODE_TTL_MS,
    );
    await this.cache.set(cooldownKey, true, EMAIL_COOLDOWN_MS);

    return {
      message: `We sent a code to ${maskEmail(user.email)}.`,
      cooldownSeconds: EMAIL_COOLDOWN_MS / 1000,
    };
  }

  /** Step 1 of turning it on: a new secret and the QR code to scan. Not active until confirmed. */
  async beginSetup(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (user.isOauthUser || !user.password) {
      throw new BadRequestException(
        'Two-step sign-in is for password accounts. GitHub accounts are protected by GitHub.',
      );
    }
    if (user.mfaEnabled)
      throw new BadRequestException('Two-step sign-in is already on.');

    const secret = authenticator.generateSecret();
    await this.userModel.updateOne(
      { _id: user._id },
      { mfaPendingSecret: secret },
    );

    const otpauthUrl = authenticator.keyuri(user.email, 'FocusFlow', secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
      margin: 1,
      width: 220,
    });
    return { qrDataUrl, secret };
  }

  /** Step 2: the first code from the app proves the scan worked, then it is switched on. */
  async confirmSetup(userId: string, code: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+mfaPendingSecret');
    if (!user?.mfaPendingSecret)
      throw new BadRequestException(
        'Start the setup again to get a new QR code.',
      );

    if (!authenticator.check(code.replace(/\s/g, ''), user.mfaPendingSecret)) {
      throw new BadRequestException(
        "That code isn't right. Check the time on your phone and try the newest code.",
      );
    }

    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: { mfaEnabled: true, mfaSecret: user.mfaPendingSecret },
        $unset: { mfaPendingSecret: 1 },
      },
    );
    await this.cache.del(CACHE_KEYS.userAuth(userId));
    return { mfaEnabled: true };
  }

  /** Turning it off asks for the password, so a borrowed open session can't do it quietly. */
  async disable(userId: string, password: string) {
    const user = await this.userModel.findById(new Types.ObjectId(userId));
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('That password is incorrect.');
    }
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: { mfaEnabled: false },
        $unset: { mfaSecret: 1, mfaPendingSecret: 1 },
      },
    );
    await this.cache.del(CACHE_KEYS.userAuth(userId));
    return { mfaEnabled: false };
  }
}
