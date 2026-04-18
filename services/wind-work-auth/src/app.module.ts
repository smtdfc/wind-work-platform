import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { GroupModule } from './group/group.module.js';
import { PrismaModule } from './common/prisma/index.js';
import { LoggerModule } from 'nestjs-pino';
import { PassportModule } from '@nestjs/passport';
import { CacheModule, JwtStrategy, SecurityModule } from '@wind-work/common';


@Module({
  imports: [
    LoggerModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { materializeKeyProvider: true },
              }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      } as any,
    }),
    AuthModule,
    UserModule,
    GroupModule,
    PrismaModule,
    PassportModule,
    SecurityModule,
    CacheModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
