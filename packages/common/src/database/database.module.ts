import { Global, Module } from "@nestjs/common";
import { Config, CONFIG_PROVIDER } from "../config/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
export const DB_ADAPTER = Symbol("DB_ADAPTER");

@Global()
@Module({
  providers: [
    {
      provide: DB_ADAPTER,
      inject: [CONFIG_PROVIDER],
      useFactory: (config: Config) => {
        return new PrismaPg({ connectionString: config.databaseURL });
      },
    },
  ],
  exports: [DB_ADAPTER],
})
export class DbAdapterModule {}
