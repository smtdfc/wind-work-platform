import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard.js';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
