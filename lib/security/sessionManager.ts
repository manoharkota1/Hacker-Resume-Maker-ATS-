"use client";

/**
 * Session Manager - Centralized session and cache management
 *
 * System Design Concepts:
 * - Single Responsibility: One module handles all session-related operations
 * - Observer Pattern: Components subscribe to auth state changes
 * - Cache Invalidation Strategy: TTL-based with manual invalidation on logout
 * - Defense in Depth: Multiple layers of security checks
 */

// Session configuration
export const SESSION_CONFIG = {
  // Session TTL in milliseconds (24 hours)
  SESSION_TTL: 24 * 60 * 60 * 1000,
  // Session check interval (5 minutes)
  CHECK_INTERVAL: 5 * 60 * 1000,
  // Maximum concurrent sessions per user
  MAX_SESSIONS: 5,
  // Cache keys prefix for easy identification
  CACHE_PREFIX: "hackora_",
  // Zustand store key
  ZUSTAND_KEY: "resume-store",
} as const;

// Cache keys that should be cleared on logout
const CLEARABLE_CACHE_KEYS = [
  SESSION_CONFIG.ZUSTAND_KEY,
  "auth_rate_",
  "hackora_",
  "resume_",
  "user_",
] as const;

// Session metadata for security tracking
interface SessionMetadata {
  createdAt: number;
  lastActivity: number;
  userAgent: string;
  fingerprint: string;
  ipHash?: string;
}

/**
 * Generate a browser fingerprint for session binding
 * This helps detect session hijacking attempts
 */
export function generateFingerprint(): string {
  if (typeof window === "undefined") return "server";

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    // @ts-expect-error - deviceMemory is not in all browsers
    navigator.deviceMemory || 0,
  ];

  // Simple hash function for fingerprint
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Store session metadata for security tracking
 */
export function storeSessionMetadata(userId: string): void {
  if (typeof window === "undefined") return;

  const metadata: SessionMetadata = {
    createdAt: Date.now(),
    lastActivity: Date.now(),
    userAgent: navigator.userAgent,
    fingerprint: generateFingerprint(),
  };

  try {
    sessionStorage.setItem(
      `${SESSION_CONFIG.CACHE_PREFIX}session_${userId}`,
      JSON.stringify(metadata)
    );
  } catch {
    // Session storage not available
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(userId: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${SESSION_CONFIG.CACHE_PREFIX}session_${userId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const metadata: SessionMetadata = JSON.parse(stored);
      metadata.lastActivity = Date.now();
      sessionStorage.setItem(key, JSON.stringify(metadata));
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Validate session fingerprint to detect hijacking
 */
export function validateSessionFingerprint(userId: string): boolean {
  if (typeof window === "undefined") return true;

  try {
    const key = `${SESSION_CONFIG.CACHE_PREFIX}session_${userId}`;
    const stored = sessionStorage.getItem(key);
    if (!stored) return true; // No metadata to validate

    const metadata: SessionMetadata = JSON.parse(stored);
    const currentFingerprint = generateFingerprint();

    return metadata.fingerprint === currentFingerprint;
  } catch {
    return true; // Fail open on errors
  }
}

/**
 * Check if session has expired based on TTL
 */
export function isSessionExpired(userId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = `${SESSION_CONFIG.CACHE_PREFIX}session_${userId}`;
    const stored = sessionStorage.getItem(key);
    if (!stored) return false;

    const metadata: SessionMetadata = JSON.parse(stored);
    return Date.now() - metadata.createdAt > SESSION_CONFIG.SESSION_TTL;
  } catch {
    return false;
  }
}

/**
 * Clear all application caches on logout
 * This is critical to prevent auto-login after logout
 */
export function clearAllCaches(): void {
  if (typeof window === "undefined") return;

  // 1. Clear localStorage items with matching prefixes
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const shouldClear = CLEARABLE_CACHE_KEYS.some(
        (prefix) => key.startsWith(prefix) || key.includes(prefix)
      );
      if (shouldClear) {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // 2. Clear sessionStorage completely
  sessionStorage.clear();

  // 3. Clear IndexedDB if exists
  if ("indexedDB" in window) {
    try {
      indexedDB.databases?.().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name?.includes("hackora") || db.name?.includes("resume")) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    } catch {
      // IndexedDB cleanup not critical
    }
  }

  // 4. Clear service worker caches if any
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name.includes("hackora") || name.includes("resume")) {
          caches.delete(name);
        }
      });
    });
  }
}

/**
 * Clear user-specific cache
 */
export function clearUserCache(userId: string): void {
  if (typeof window === "undefined") return;

  // Clear user-specific items
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes(userId)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear session metadata
  sessionStorage.removeItem(`${SESSION_CONFIG.CACHE_PREFIX}session_${userId}`);
}

/**
 * Mark user as logged out to prevent auto-login
 */
export function setLogoutFlag(): void {
  if (typeof window === "undefined") return;

  // Set a flag with short TTL to prevent immediate re-login
  sessionStorage.setItem(
    `${SESSION_CONFIG.CACHE_PREFIX}logged_out`,
    Date.now().toString()
  );
}

/**
 * Check if user recently logged out
 */
export function hasRecentlyLoggedOut(): boolean {
  if (typeof window === "undefined") return false;

  const logoutTime = sessionStorage.getItem(
    `${SESSION_CONFIG.CACHE_PREFIX}logged_out`
  );

  if (!logoutTime) return false;

  // Consider "recently" as within last 5 seconds
  return Date.now() - parseInt(logoutTime, 10) < 5000;
}

/**
 * Clear the logout flag
 */
export function clearLogoutFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${SESSION_CONFIG.CACHE_PREFIX}logged_out`);
}
