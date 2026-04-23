import { Controller, Inject, Req, Res } from '@nestjs/common';
import {
  RequestFromContract,
  throwErrorFromContract,
  ValidateFromContract,
} from '@wind-work/contractor-for-nestjs';
import {
  GetProfile,
  InvalidSessionError,
  RefreshSession,
  SignInWithEmail,
  SignInWithEmailRequest,
  SignOut,
} from '@wind-work/contracts/wind-work-auth';
import { AuthService } from './auth.service.js';

import '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
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

  @RequestFromContract(RefreshSession)
  async refreshSession(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const cookieObj = req.unsignCookie(req.cookies['rt'] || '');

    if (!cookieObj.valid || !cookieObj.value) {
      throwErrorFromContract(InvalidSessionError, {});
    }
    const { response, tokens } = await this.authService.refresh(
      cookieObj.value,
    );

    if (tokens.refreshToken) {
      const isProd = this.config.isProduction;
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
  @RequestFromContract(SignOut)
  async logout(
    @User('id') userId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const cookieObj = req.unsignCookie(req.cookies['rt'] || '');

    if (!cookieObj.valid || !cookieObj.value) {
      throwErrorFromContract(InvalidSessionError, {});
    }

    await this.authService.signOut(cookieObj.value);
    res.clearCookie('rt');

    return 'Done';
  }
}
