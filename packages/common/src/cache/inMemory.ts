import { ICacheStrategy } from "../types/index.js";

export class InMemoryCacheStrategy implements ICacheStrategy {
    private cache = new Map<string, { value: string; expiresAt: number | null }>();

    async set(key: string, value: string, ttl?: number): Promise<void> {
        const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
        this.cache.set(key, { value, expiresAt });

        if (ttl) {
            setTimeout(() => {
                this.deleteIfExpired(key);
            }, ttl * 1000);
        }
    }

    async get(key: string): Promise<string | null> {
        const item = this.cache.get(key);

        if (!item) return null;

        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async del(key: string): Promise<void> {
        this.cache.delete(key);
    }

    private deleteIfExpired(key: string) {
        const item = this.cache.get(key);
        if (item && item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(key);
        }
    }
}