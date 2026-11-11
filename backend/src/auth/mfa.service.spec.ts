import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { authenticator } from 'otplib';
import { maskEmail, MfaService } from './mfa.service';

const JWT_SECRET = 'test-secret';

describe('MfaService', () => {
  const secret = authenticator.generateSecret();
  const userId = new Types.ObjectId();
  const user = {
    _id: userId,
    email: 'alex@example.com',
    displayName: 'Alex',
    mfaEnabled: true,
    mfaSecret: secret,
  };

  let store: Map<string, unknown>;
  let jwt: JwtService;
  let service: MfaService;

  beforeEach(() => {
    store = new Map();
    const cache = {
      get: jest.fn(async (key: string) => store.get(key)),
      set: jest.fn(async (key: string, value: unknown) => {
        store.set(key, value);
      }),
      del: jest.fn(async (key: string) => {
        store.delete(key);
      }),
    };
    const userModel = {
      findById: jest.fn(() => ({
        select: () => Promise.resolve(user),
        then: (fn: (u: typeof user) => unknown) => Promise.resolve(fn(user)),
      })),
    };
    jwt = new JwtService({ secret: JWT_SECRET });
    service = new MfaService(
      userModel as any,
      jwt,
      { get: () => JWT_SECRET } as any,
      { sendEmail: jest.fn() } as any,
      cache as any,
    );
  });

  it('accepts the current authenticator code once', async () => {
    const { mfaToken } = service.startChallenge(user as any);
    const result = await service.verifyChallenge(
      mfaToken,
      authenticator.generate(secret),
      'authenticator',
    );
    expect(result).toBe(user);

    // The same ticket can't be replayed.
    await expect(
      service.verifyChallenge(
        mfaToken,
        authenticator.generate(secret),
        'authenticator',
      ),
    ).rejects.toThrow(/already used/);
  });

  it('locks the ticket after five wrong codes', async () => {
    const { mfaToken } = service.startChallenge(user as any);
    for (let i = 0; i < 5; i += 1) {
      await expect(
        service.verifyChallenge(mfaToken, '000000', 'authenticator'),
      ).rejects.toThrow();
    }
    await expect(
      service.verifyChallenge(
        mfaToken,
        authenticator.generate(secret),
        'authenticator',
      ),
    ).rejects.toThrow(/Too many/);
  });

  it('signs the ticket with a separate secret so it is not a usable access token', () => {
    const { mfaToken } = service.startChallenge(user as any);
    expect(() => jwt.verify(mfaToken, { secret: JWT_SECRET })).toThrow();
  });

  it('accepts an emailed code once it has been sent', async () => {
    const { mfaToken } = service.startChallenge(user as any);
    await service.sendEmailCode(mfaToken);
    const sent = (service as any).emailService.sendEmail.mock.calls[0][0]
      .context.code as string;
    await expect(
      service.verifyChallenge(mfaToken, sent, 'email'),
    ).resolves.toBe(user);
  });

  it('does not start a cooldown or keep a code when the email fails to send', async () => {
    const { mfaToken } = service.startChallenge(user as any);
    (service as any).emailService.sendEmail.mockRejectedValueOnce(
      new Error('SMTP down'),
    );

    await expect(service.sendEmailCode(mfaToken)).rejects.toThrow(
      /couldn't send/,
    );
    expect(
      [...store.keys()].some(
        (key) =>
          key.startsWith('mfaEmailCooldown') || key.startsWith('mfaEmailCode'),
      ),
    ).toBe(false);
    // The person can try again straight away.
    await expect(service.sendEmailCode(mfaToken)).resolves.toMatchObject({
      cooldownSeconds: 30,
    });
  });

  it('masks email addresses for display', () => {
    expect(maskEmail('alex@example.com')).toBe('a•••@example.com');
    expect(maskEmail('jo@x.io')).toBe('j••@x.io');
  });
});
