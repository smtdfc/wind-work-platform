import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';
import { FastifyRequest } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    getToken: (req: FastifyRequest) => req.headers['x-csrf-token'] as string,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
