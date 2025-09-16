import { LRUCache } from "lru-cache";

interface RateResult {
  ok: boolean;
  remaining: number;
}

class RateLimiter {
  private store: LRUCache<string, { count: number; reset: number }>;

  constructor(private limit: number, private windowMs: number) {
    this.store = new LRUCache({ max: 5000 });
  }

  consume(key: string, weight = 1): RateResult {
    const now = Date.now();
    const existing = this.store.get(key);
    if (!existing || existing.reset < now) {
      this.store.set(key, { count: weight, reset: now + this.windowMs });
      return { ok: true, remaining: this.limit - weight };
    }
    if (existing.count + weight > this.limit) {
      return { ok: false, remaining: 0 };
    }
    existing.count += weight;
    this.store.set(key, existing);
    return { ok: true, remaining: this.limit - existing.count };
  }
}

const authLimiter = new RateLimiter(10, 60 * 1000);
const uploadLimiter = new RateLimiter(5, 60 * 1000);

export function getAuthLimiter() {
  return authLimiter;
}

export function getUploadLimiter() {
  return uploadLimiter;
}
