/* @/utils/cacheService.ts */

class MemCache {
  private cache: Map<number | bigint, any>;

  constructor() {
    this.cache = new Map();
  }

  set(key: number | bigint, value: any, TTL: number = Number.MAX_SAFE_INTEGER) {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), TTL * 1000);
  }
  get(key: number | bigint) {
    return Object.freeze(this.cache.get(key));
  }
  has(key: number | bigint) {
    return this.cache.has(key);
  }
  clear() {
    this.cache.clear();
  }
}
const memCache = new MemCache();

// In-memory first, then Redis as a fallback
export default new (class GlobalCache {
  set(key: number | bigint, value: any, TTL: number = Number.MAX_SAFE_INTEGER) {
    memCache.set(key, value, TTL);
  }
  async get(key: number | bigint) {
    const inMemory = memCache.has(key);
    if (inMemory) {
      return memCache.get(key);
    }
  }
  has(key: number | bigint) {
    return memCache.has(key);
  }
  async clear() {
    memCache.clear();
    return Bun.gc(true); // force garbage collection, synchronously
  }
})();

export { memCache };
