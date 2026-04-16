import { Global, Module } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export const CONFIG_PROVIDER = Symbol("db");

export type Config = {
  databaseURL: string;
  jwtPublicKey: string;
  jwtPrivatekey: string;
  isProduction: boolean;
  appDomain: string;
};

@Global()
@Module({
  providers: [
    {
      provide: CONFIG_PROVIDER,
      useFactory: () => {
        const config: Partial<Config> = {
          databaseURL: process.env.DATABASE_URL!,
          isProduction: process.env.NODE_ENV === "production",
          appDomain: process.env.APP_DOMAIN ?? ".your-domain",
        };
        const rootPath = process.cwd();
        const jwtPublicKeyFile = process.env.JWT_PUBLIC_KEY_FILE;
        const jwtPrivateKeyFile = process.env.JWT_PRIVATE_KEY_FILE;

        if (jwtPublicKeyFile)
          config.jwtPublicKey = fs.readFileSync(
            path.join(rootPath, jwtPublicKeyFile),
            "utf8",
          );

        if (jwtPrivateKeyFile)
          config.jwtPrivatekey = fs.readFileSync(
            path.join(rootPath, jwtPrivateKeyFile),
            "utf8",
          );

        return config;
      },
    },
  ],
  exports: [CONFIG_PROVIDER],
})
export class ConfigModule {}
