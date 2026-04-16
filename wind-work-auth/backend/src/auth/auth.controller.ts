import { Controller, Inject, Res } from '@nestjs/common';
import {
  RequestFromContract,
  ValidateFromContract,
} from '@wind-work/contractor-for-nestjs';
import {
  GetProfile,
  SignInWithEmail,
  SignInWithEmailRequest,
} from '@wind-work/contracts/wind-work-auth';
import { AuthService } from './auth.service.js';

import '@fastify/cookie';
import type { FastifyReply } from 'fastify';
import { Auth, type Config, CONFIG_PROVIDER, User } from '@wind-work/common';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(CONFIG_PROVIDER) private config: Config,
  ) {}

  @RequestFromContract(SignInWithEmail)
  async signInWithEmail(
    @Res({ passthrough: true }) res: FastifyReply,
    @ValidateFromContract() body: SignInWithEmailRequest,
  ) {
    const { response, tokens } = await this.authService.signInWithEmail(body);

    if (tokens.refreshToken) {
      const isProd = this.config.isProduction;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      res.setCookie('rt', tokens.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        domain: this.config.appDomain,
        maxAge: 7 * 24 * 60 * 60,
        signed: true,
      });
    }
    return response;
  }

  @Auth()
  @RequestFromContract(GetProfile)
  async getProfile(@User('id') userId: string) {
    return await this.authService.getProfile(userId);
  }
}
