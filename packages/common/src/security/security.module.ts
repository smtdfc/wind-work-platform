import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller.js';

@Module({
  controllers: [SecurityController],
  providers: [],
})
export class SecurityModule {}
