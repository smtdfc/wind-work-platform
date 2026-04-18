import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserRepository } from '../user/user.repository.js';
import {
  AuthenticationMethodRepository,
  SessionRepository,
} from './auth.repository.js';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AuthenticationMethodRepository,
    SessionRepository,
    JwtService,
  ],
})
export class AuthModule {}
