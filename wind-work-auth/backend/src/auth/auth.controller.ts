import { Controller } from '@nestjs/common';
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
import { User } from '../common/decorators/user.decorator.js';
import { Auth } from '../common/decorators/auth.decorator.js';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @RequestFromContract(SignInWithEmail)
  async signInWithEmail(@ValidateFromContract() body: SignInWithEmailRequest) {
    return await this.authService.signInWithEmail(body);
  }

  @Auth()
  @RequestFromContract(GetProfile)
  async getProfile(@User('userId') userId: string) {
    return await this.authService.getProfile(userId);
  }
}
