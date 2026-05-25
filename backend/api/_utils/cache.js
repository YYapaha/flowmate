'use strict';

const MAX = 256;

class LRUCache {
  constructor(max = MAX) {
    this.max = max;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    // refresh recency
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.max) {
      // evict oldest
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(key, value);
  }
}

const classifyCache = new LRUCache();
const decomposeCache = new LRUCache(64);

module.exports = { classifyCache, decomposeCache };
