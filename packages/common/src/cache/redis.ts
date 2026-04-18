import {ICacheStrategy} from "../types/index.js";
import {Redis} from "ioredis";
import {RedisConfig} from "../config/index.js";

export class RedisCacheStrategy implements ICacheStrategy {
    private readonly redis: Redis;

    constructor(options: RedisConfig) {
        this.redis = new Redis({
            host: options.host || 'localhost',
            port: options.port || 6379,
            password: options.password,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.set(key, value, 'EX', ttl);
        } else {
            await this.redis.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }
}