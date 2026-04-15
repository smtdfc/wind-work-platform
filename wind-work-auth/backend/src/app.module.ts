import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { GroupModule } from './group/group.module.js';
import { PrismaModule } from './common/prisma/index.js';
import { ConfigModule } from './common/config/index.js';
import { LoggerModule } from 'nestjs-pino';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './common/providers/jwt.provider.js';
import { SecurityModule } from './common/security/security.module.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { materializeKeyProvider: true },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    AuthModule,
    UserModule,
    GroupModule,
    PrismaModule,
    ConfigModule,
    PassportModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
