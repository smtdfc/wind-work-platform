import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { GroupModule } from './group/group.module.js';
import { PrismaModule } from './common/prisma/index.js';
import { LoggerModule } from 'nestjs-pino';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, SecurityModule } from '@wind-work/common';

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
    PassportModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
