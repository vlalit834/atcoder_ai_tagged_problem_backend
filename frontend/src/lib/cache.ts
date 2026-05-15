type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const STORAGE_PREFIX = "atcoder-cache:";
const DEFAULT_TTL_MS = 60 * 60 * 1000;

function readStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, entry: CacheEntry<T>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota exceeded - ignore */
  }
}

export interface CacheOptions {
  ttl?: number;
  persist?: boolean;
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const ttl = options.ttl ?? DEFAULT_TTL_MS;
  const persist = options.persist ?? true;
  const now = Date.now();

  const memHit = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memHit && now - memHit.timestamp < ttl) {
    return memHit.data;
  }

  if (persist) {
    const diskHit = readStorage<T>(key);
    if (diskHit && now - diskHit.timestamp < ttl) {
      memoryCache.set(key, diskHit);
      return diskHit.data;
    }
  }

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fetcher()
    .then((data) => {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() };
      memoryCache.set(key, entry);
      if (persist) writeStorage(key, entry);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      const keys = Object.keys(window.localStorage);
      for (const k of keys) {
        if (k.startsWith(STORAGE_PREFIX)) window.localStorage.removeItem(k);
      }
    }
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) memoryCache.delete(k);
  }
  if (typeof window !== "undefined") {
    const keys = Object.keys(window.localStorage);
    for (const k of keys) {
      if (k.startsWith(STORAGE_PREFIX + keyPrefix)) {
        window.localStorage.removeItem(k);
      }
    }
  }
}
