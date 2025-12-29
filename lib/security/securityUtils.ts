/**
 * Security Utilities - System Design for Scalable Security
 *
 * Design Patterns Used:
 * - Strategy Pattern: Different validation strategies for different contexts
 * - Decorator Pattern: Add security features without modifying core logic
 * - Circuit Breaker: Prevent cascade failures on security checks
 */

// CSRF Token management
const CSRF_TOKEN_KEY = "hackora_csrf_token";
const CSRF_TOKEN_HEADER = "X-CSRF-Token";

/**
 * Generate a cryptographically secure random token
 */
export function generateCSRFToken(): string {
  if (typeof window === "undefined") return "";

  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Get or create CSRF token for current session
 */
export function getCSRFToken(): string {
  if (typeof window === "undefined") return "";

  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken === token && token.length > 0;
}

/**
 * Get headers with CSRF token for fetch requests
 */
export function getSecureHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    [CSRF_TOKEN_HEADER]: getCSRFToken(),
  };
}

/**
 * Rate limiting with exponential backoff
 */
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  backoffUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, backoffUntil: 0 });
    return { allowed: true };
  }

  // Check if in backoff period
  if (entry.backoffUntil > now) {
    return { allowed: false, retryAfter: entry.backoffUntil - now };
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, backoffUntil: 0 });
    return { allowed: true };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxAttempts) {
    // Exponential backoff: 2^(attempts over limit) seconds, max 1 hour
    const backoffSeconds = Math.min(
      Math.pow(2, entry.count - maxAttempts),
      3600
    );
    entry.backoffUntil = now + backoffSeconds * 1000;
    return { allowed: false, retryAfter: backoffSeconds * 1000 };
  }

  return { allowed: true };
}

/**
 * Reset rate limit for a key (e.g., on successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Hash sensitive data for logging (partial reveal)
 */
export function maskSensitiveData(
  data: string,
  revealChars: number = 4
): string {
  if (data.length <= revealChars * 2) {
    return "*".repeat(data.length);
  }
  const start = data.slice(0, revealChars);
  const end = data.slice(-revealChars);
  const masked = "*".repeat(Math.min(data.length - revealChars * 2, 10));
  return `${start}${masked}${end}`;
}

/**
 * Security event types for audit logging
 */
export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "SIGNUP_SUCCESS"
  | "SIGNUP_FAILURE"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "SESSION_EXPIRED"
  | "RATE_LIMIT_EXCEEDED"
  | "SUSPICIOUS_ACTIVITY";

interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  userId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

// In-memory audit log (in production, this would go to a logging service)
const auditLog: SecurityEvent[] = [];
const MAX_AUDIT_LOG_SIZE = 1000;

/**
 * Log security event for audit trail
 */
export function logSecurityEvent(
  type: SecurityEventType,
  data?: { userId?: string; email?: string; metadata?: Record<string, unknown> }
): void {
  const event: SecurityEvent = {
    type,
    timestamp: Date.now(),
    userId: data?.userId,
    email: data?.email ? maskSensitiveData(data.email) : undefined,
    metadata: data?.metadata,
  };

  auditLog.push(event);

  // Keep audit log bounded
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.shift();
  }

  // In production, send to logging service
  if (process.env.NODE_ENV === "development") {
    // Only log critical events in dev
    if (
      ["LOGIN_FAILURE", "RATE_LIMIT_EXCEEDED", "SUSPICIOUS_ACTIVITY"].includes(
        type
      )
    ) {
      // Silent in production
    }
  }
}

/**
 * Get recent security events (for admin dashboard)
 */
export function getRecentSecurityEvents(count: number = 50): SecurityEvent[] {
  return auditLog.slice(-count);
}

/**
 * Detect suspicious patterns in security events
 */
export function detectSuspiciousActivity(userId: string): boolean {
  const userEvents = auditLog.filter(
    (e) => e.userId === userId && Date.now() - e.timestamp < 3600000 // Last hour
  );

  const failedLogins = userEvents.filter(
    (e) => e.type === "LOGIN_FAILURE"
  ).length;
  const rateLimitHits = userEvents.filter(
    (e) => e.type === "RATE_LIMIT_EXCEEDED"
  ).length;

  // Flag if too many failures or rate limit hits
  return failedLogins > 10 || rateLimitHits > 5;
}
