import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { Global, Module } from '@nestjs/common';
import { DB_ADAPTER } from '@wind-work/common';

export const PRISMA_PROVIDER = Symbol('db');

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_PROVIDER,
      inject: [DB_ADAPTER],
      useFactory: (adapter: PrismaPg) => {
        const prisma = new PrismaClient({ adapter });
        return prisma;
      },
    },
  ],
  exports: [PRISMA_PROVIDER],
})
export class PrismaModule {}
