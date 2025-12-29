/**
 * Security Module Index
 *
 * Centralized exports for all security-related utilities
 *
 * Architecture Notes:
 * - All security functions are client-side for this SPA
 * - Server-side security is handled by Appwrite
 * - For enterprise scale, add:
 *   - WAF (Web Application Firewall)
 *   - DDoS protection at CDN level
 *   - Server-side rate limiting with Redis
 *   - JWT token rotation
 *   - IP reputation scoring
 */

export {
  // Session Management
  SESSION_CONFIG,
  generateFingerprint,
  storeSessionMetadata,
  updateLastActivity,
  validateSessionFingerprint,
  isSessionExpired,
  clearAllCaches,
  clearUserCache,
  setLogoutFlag,
  hasRecentlyLoggedOut,
  clearLogoutFlag,
} from "./sessionManager";

export {
  // Security Utilities
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  getSecureHeaders,
  checkRateLimit,
  resetRateLimit,
  sanitizeInput,
  isValidEmail,
  maskSensitiveData,
  logSecurityEvent,
  getRecentSecurityEvents,
  detectSuspiciousActivity,
  type SecurityEventType,
} from "./securityUtils";
