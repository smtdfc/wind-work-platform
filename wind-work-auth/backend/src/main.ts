import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import { FastifyRequest } from 'fastify';
import { Module } from '@nestjs/common';
import {
  AllExceptionsFilter,
  ConfigModule,
  DbAdapterModule,
  TransformInterceptor,
} from '@wind-work/common';

@Module({
  imports: [ConfigModule, DbAdapterModule, AppModule],
})
class RootModule {}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    RootModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useLogger(app.get(Logger));
  await app.register(fastifyCookie as any, {
    secret: process.env.COOKIE_SECRET,
  });

  await app.register(fastifyCsrf as any, {
    cookieOpts: {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },

    getToken: (req: FastifyRequest) => req.headers['x-csrf-token'] as string,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
