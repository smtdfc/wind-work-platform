import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AuthenticationMethodRepository,
  SessionRepository,
} from './auth.repository.js';
import {
  GetProfileResponse,
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
import { type Config, CONFIG_PROVIDER } from '../common/config/index.js';
import { User } from '../generated/prisma/client.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    private authMethodRepo: AuthenticationMethodRepository,
    private sessionRepo: SessionRepository,
    private userRepo: UserRepository,
    @Inject(CONFIG_PROVIDER) private config: Config,
  ) {}

  async generateToken(user: User) {
    const payload = { sub: user.id };

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

    const tokens = await this.generateToken(user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const expiresAt = new Date(Date.now() + ms('7d'));
    await this.sessionRepo.create(
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

  // async refresh(refreshToken: string) {}
}
