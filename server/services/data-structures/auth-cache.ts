/**
 * auth-cache.ts
 * 
 * Data Structure 1: In-Memory Hash Map Cache (O(1))
 * Fast lookup (<0.1ms) for user profiles, phoneHash, telegramChatIdHash,
 * and public guest sessions without continuous database roundtrips.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class AuthHashCache {
  private userCache: Map<string, CacheEntry<any>> = new Map();
  private phoneHashCache: Map<string, CacheEntry<any>> = new Map();
  private telegramHashCache: Map<string, CacheEntry<any>> = new Map();
  private guestSessionCache: Map<string, CacheEntry<{ queriesLeft: number; createdAt: number; messages: any[] }>> = new Map();
  private defaultTTL: number = 15 * 60 * 1000; // 15 minutes in ms

  /**
   * Set user in cache by userId (O(1))
   */
  setUser(userId: string, user: any, ttl = this.defaultTTL): void {
    this.userCache.set(userId, {
      data: user,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Get user by userId (O(1))
   */
  getUser(userId: string): any | null {
    const entry = this.userCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.userCache.delete(userId);
      return null;
    }
    return entry.data;
  }

  /**
   * Cache user by phoneHash (O(1))
   */
  setUserByPhoneHash(phoneHash: string, user: any, ttl = this.defaultTTL): void {
    this.phoneHashCache.set(phoneHash, {
      data: user,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Get user by phoneHash (O(1))
   */
  getUserByPhoneHash(phoneHash: string): any | null {
    const entry = this.phoneHashCache.get(phoneHash);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.phoneHashCache.delete(phoneHash);
      return null;
    }
    return entry.data;
  }

  /**
   * Cache user by telegramChatIdHash (O(1))
   */
  setUserByTelegramHash(telegramChatIdHash: string, user: any, ttl = this.defaultTTL): void {
    this.telegramHashCache.set(telegramChatIdHash, {
      data: user,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Get user by telegramChatIdHash (O(1))
   */
  getUserByTelegramHash(telegramChatIdHash: string): any | null {
    const entry = this.telegramHashCache.get(telegramChatIdHash);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.telegramHashCache.delete(telegramChatIdHash);
      return null;
    }
    return entry.data;
  }

  /**
   * Get or initialize guest session (O(1))
   */
  getGuestSession(guestId: string, initialQuota = 10): { queriesLeft: number; isNew: boolean; messages: any[] } {
    const entry = this.guestSessionCache.get(guestId);
    if (!entry || Date.now() > entry.expiresAt) {
      const newSession = { queriesLeft: initialQuota, createdAt: Date.now(), messages: [] };
      this.guestSessionCache.set(guestId, {
        data: newSession,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });
      return { queriesLeft: initialQuota, isNew: true, messages: [] };
    }
    return { queriesLeft: entry.data.queriesLeft, isNew: false, messages: entry.data.messages || [] };
  }

  /**
   * Save message to guest session (O(1))
   */
  addGuestMessage(guestId: string, message: { role: string; content: string; timestamp?: string }): void {
    const entry = this.guestSessionCache.get(guestId);
    if (entry) {
      if (!entry.data.messages) entry.data.messages = [];
      entry.data.messages.push({ ...message, timestamp: message.timestamp || new Date().toISOString() });
      if (entry.data.messages.length > 20) {
        entry.data.messages = entry.data.messages.slice(-20);
      }
    }
  }

  /**
   * Decrement guest query quota (O(1))
   */
  decrementGuestQuota(guestId: string): number {
    const entry = this.guestSessionCache.get(guestId);
    if (!entry) {
      this.getGuestSession(guestId);
      return 9;
    }
    entry.data.queriesLeft = Math.max(0, entry.data.queriesLeft - 1);
    return entry.data.queriesLeft;
  }

  /**
   * Invalidate user cache on updates
   */
  invalidateUser(userId: string, phoneHash?: string, telegramHash?: string): void {
    this.userCache.delete(userId);
    if (phoneHash) this.phoneHashCache.delete(phoneHash);
    if (telegramHash) this.telegramHashCache.delete(telegramHash);
  }

  /**
   * Periodic sweep of expired items
   */
  sweep(): void {
    const now = Date.now();
    this.userCache.forEach((v, k) => { if (now > v.expiresAt) this.userCache.delete(k); });
    this.phoneHashCache.forEach((v, k) => { if (now > v.expiresAt) this.phoneHashCache.delete(k); });
    this.telegramHashCache.forEach((v, k) => { if (now > v.expiresAt) this.telegramHashCache.delete(k); });
    this.guestSessionCache.forEach((v, k) => { if (now > v.expiresAt) this.guestSessionCache.delete(k); });
  }
}

export const authHashCache = new AuthHashCache();

setInterval(() => authHashCache.sweep(), 10 * 60 * 1000);
