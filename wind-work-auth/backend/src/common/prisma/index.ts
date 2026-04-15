import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { Global, Module } from '@nestjs/common';
import { Config, CONFIG_PROVIDER } from '../config/index.js';

export const PRISMA_PROVIDER = Symbol('db');

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_PROVIDER,
      inject: [CONFIG_PROVIDER],
      useFactory: (config: Config) => {
        const adapter = new PrismaPg({
          connectionString: `${config.databaseURL}`,
        });
        const prisma = new PrismaClient({ adapter });
        return prisma;
      },
    },
  ],
  exports: [PRISMA_PROVIDER],
})
export class PrismaModule {}
