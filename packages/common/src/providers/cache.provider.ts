import {Config, CONFIG_PROVIDER} from "../config/index.js";
import {RedisCacheStrategy} from "../cache/index.js";
import {InMemoryCacheStrategy} from "../cache/index.js";
import {DynamicModule, Global, Logger, Module} from "@nestjs/common";

export const CACHE_PROVIDER = Symbol("cache");

@Global()
@Module({})
export class CacheModule {
    private static readonly logger = new Logger('CacheModule');

    static register(): DynamicModule {
        return {
            module: CacheModule,
            providers: [
                {
                    provide: CACHE_PROVIDER,
                    useFactory: async (configService: Config) => {
                        const isRedisMode = configService.cacheStrategy === "redis";

                        if (isRedisMode) {
                            try {
                                if(!configService.redis) {
                                    throw new Error("Redis config is missing");
                                }

                                const redis = new RedisCacheStrategy(configService.redis);
                                this.logger.log("Redis Cache Strategy initialized.");
                                return redis;
                            } catch (e) {
                                this.logger.error("Redis failed, falling back to InMemory!");
                                return new InMemoryCacheStrategy();
                            }
                        }

                        this.logger.log("InMemory Cache Strategy initialized.");
                        return new InMemoryCacheStrategy();
                    },
                    inject: [CONFIG_PROVIDER],
                },
            ],
            exports: [CACHE_PROVIDER],
        };
    }
}