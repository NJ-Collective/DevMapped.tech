export class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = new Map();
    this.defaultTTL = 3600000; // 1 hour in ms
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    if (ttl) {
      this.cacheTTL.set(key, Date.now() + ttl);
    }
  }

  get(key) {
    const expiry = this.cacheTTL.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheTTL.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
    this.cacheTTL.clear();
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}