import { Inject, Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from './auth.repository.js';
import {
  GetProfileResponse,
  InvalidSessionError,
  RefreshSessionResponse,
  SignInInformationIncorrectError,
  SignInWithEmailRequest,
  SignInWithEmailResponse,
  UserNotFoundError,
} from '@wind-work/contracts/wind-work-auth';
import { UserRepository } from '../user/user.repository.js';
import { throwErrorFromContract } from '@wind-work/contractor-for-nestjs';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import ms from 'ms';
import { v4 } from 'uuid';

import {
  CACHE_PROVIDER,
  type Config,
  CONFIG_PROVIDER,
  IAuthTokenPayload,
} from '@wind-work/common';
import { type ICacheStrategy } from '@wind-work/common';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private sessionRepo: SessionRepository,
    private userRepo: UserRepository,
    @Inject(CONFIG_PROVIDER) private config: Config,
    @Inject(CACHE_PROVIDER) private cache: ICacheStrategy,
  ) {}

  async generateToken(userId: string, sid: string) {
    const payload = { sub: userId, sid: sid };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
        secret: this.config.jwtPrivatekey,
        algorithm: 'RS256',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.jwtPrivatekey,
        algorithm: 'RS256',
      }),
    };
  }

  async signInWithEmail(request: SignInWithEmailRequest) {
    const user = await this.userRepo.findForSignIn(request.email);
    if (!user) {
      throwErrorFromContract(SignInInformationIncorrectError, {});
    }

    const passwordMethod = user.authMethods.find(
      (v) => v.method === 'PASSWORD',
    );

    if (!passwordMethod) {
      throwErrorFromContract(SignInInformationIncorrectError, {});
    }

    const isMatch = await argon2.verify(
      passwordMethod?.value,
      request.password,
    );

    if (!isMatch) {
      throwErrorFromContract(SignInInformationIncorrectError, {});
    }

    const sid = v4();
    const expiresAt = new Date(Date.now() + ms('7d'));
    const tokens = await this.generateToken(user.id, sid);
    await this.sessionRepo.create(
      sid,
      tokens.refreshToken,
      expiresAt,
      user.id,
      passwordMethod?.id,
    );

    return {
      response: new SignInWithEmailResponse({
        user,
        tokens,
      }),
      tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findUserByID(userId);
    if (!user) {
      throwErrorFromContract(UserNotFoundError, {});
    }

    return new GetProfileResponse({ user });
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<IAuthTokenPayload>(
      refreshToken,
      {
        secret: this.config.jwtPublicKey,
      },
    );

    const session = await this.sessionRepo.findById(payload.sid);
    if (!session || session.isBlocked)
      throwErrorFromContract(InvalidSessionError, {});

    const GRACE_PERIOD = 30 * 1000;

    if (refreshToken === session.oldRefreshToken) {
      const timeSinceReplacement =
        Date.now() - (session.replacedAt?.getTime() ?? 0);

      if (timeSinceReplacement <= GRACE_PERIOD) {
        const tokens = await this.generateToken(session.userId, session.id);
        return { response: new RefreshSessionResponse({ tokens }), tokens };
      } else {
        await this.sessionRepo.blockAllByUserId(session.userId);
        throwErrorFromContract(InvalidSessionError, {});
      }
    }

    if (refreshToken !== session.refreshToken) {
      await this.sessionRepo.blockAllByUserId(session.userId);
      throwErrorFromContract(InvalidSessionError, {});
    }

    const tokens = await this.generateToken(session.userId, session.id);
    const expiresAt = new Date(Date.now() + ms('7d'));

    await this.sessionRepo.updateRotation(session.id, {
      oldRefreshToken: refreshToken,
      newRefreshToken: tokens.refreshToken,
      expiresAt,
    });

    return { response: new RefreshSessionResponse({ tokens }), tokens };
  }

  async signOut(refreshToken: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync<IAuthTokenPayload>(
      refreshToken,
      { secret: this.config.jwtPublicKey },
    );

    const session = await this.sessionRepo.findById(payload.sid);

    if (!session || session.isBlocked) {
      throwErrorFromContract(InvalidSessionError, {});
    }

    await this.sessionRepo.update(payload.sid, {
      isBlocked: true,
      logoutAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    this.cache.set(
      `blacklist:token:${refreshToken}`,
      'true',
      payload.exp - Math.floor(Date.now() / 1000),
    );
  }

  private async getTokensForSession(sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.isBlocked) {
      throwErrorFromContract(InvalidSessionError, {});
    }

    return this.generateToken(session.userId, session.id);
  }
}
