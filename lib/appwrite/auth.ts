"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  account,
  ID,
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
} from "./config";
import { Models, AppwriteException } from "appwrite";
import {
  clearAllCaches,
  storeSessionMetadata,
  validateSessionFingerprint,
  isSessionExpired,
  setLogoutFlag,
  hasRecentlyLoggedOut,
  clearLogoutFlag,
} from "@/lib/security/sessionManager";
import {
  logSecurityEvent,
  detectSuspiciousActivity,
} from "@/lib/security/securityUtils";

// Security constants
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check session every 5 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes lockout
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window for rate limiting

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendPasswordRecovery: (
    email: string
  ) => Promise<{ success: boolean; userId?: string } | null>;
  resetPassword: (
    userId: string,
    secret: string,
    password: string
  ) => Promise<boolean>;
  isAuthenticated: boolean;
  isLocked: boolean;
  lockoutRemaining: number;
  clearError: () => void;
}

// Rate limiting state (stored in memory for client-side)
interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Secure input sanitization
function sanitizeInput(input: string): string {
  return input.trim().slice(0, 256); // Limit length and trim whitespace
}

// Email validation with regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password strength validation
function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain an uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain a lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain a number" };
  }
  return { valid: true, message: "" };
}

// Name validation
function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s'-]+$/.test(name);
}

// Get rate limit state from localStorage
function getRateLimitState(email: string): RateLimitState {
  if (typeof window === "undefined") {
    return { attempts: 0, firstAttempt: 0, lockedUntil: 0 };
  }

  try {
    const key = `auth_rate_${btoa(email).slice(0, 20)}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
  return { attempts: 0, firstAttempt: 0, lockedUntil: 0 };
}

// Save rate limit state to localStorage
function setRateLimitState(email: string, state: RateLimitState): void {
  if (typeof window === "undefined") return;

  try {
    const key = `auth_rate_${btoa(email).slice(0, 20)}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

// Clear rate limit state
function clearRateLimitState(email: string): void {
  if (typeof window === "undefined") return;

  try {
    const key = `auth_rate_${btoa(email).slice(0, 20)}`;
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

// Parse Appwrite errors for user-friendly messages
function parseAuthError(err: unknown): string {
  if (err instanceof AppwriteException) {
    switch (err.code) {
      case 401:
        return "Invalid email or password";
      case 409:
        return "An account with this email already exists";
      case 429:
        return "Too many requests. Please try again later";
      case 500:
        return "Server error. Please try again later";
      default:
        return err.message || "Authentication failed";
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred";
}

export function useAuthState() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lockoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any sensitive data on unmount
  useEffect(() => {
    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkSession = useCallback(async () => {
    try {
      // Don't auto-login if user recently logged out
      if (hasRecentlyLoggedOut()) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const currentUser = await account.get();

      // Validate session fingerprint to detect hijacking
      if (!validateSessionFingerprint(currentUser.$id)) {
        logSecurityEvent("SUSPICIOUS_ACTIVITY", {
          userId: currentUser.$id,
          metadata: { reason: "fingerprint_mismatch" },
        });
        // Force logout on fingerprint mismatch
        await account.deleteSession("current");
        setUser(null);
        return null;
      }

      // Check session expiry
      if (isSessionExpired(currentUser.$id)) {
        logSecurityEvent("SESSION_EXPIRED", { userId: currentUser.$id });
        await account.deleteSession("current");
        setUser(null);
        return null;
      }

      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session check only once
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Periodic session validation - separate effect to avoid re-running on user change
  useEffect(() => {
    sessionCheckRef.current = setInterval(() => {
      // Only check if window is visible and user exists
      if (document.visibilityState === "visible") {
        // Check logout flag first
        if (hasRecentlyLoggedOut()) {
          setUser(null);
          return;
        }

        account
          .get()
          .then((user) => {
            // Validate fingerprint on periodic check
            if (
              !validateSessionFingerprint(user.$id) ||
              isSessionExpired(user.$id)
            ) {
              setUser(null);
              account.deleteSession("current").catch(() => {});
            } else {
              setUser(user);
            }
          })
          .catch(() => setUser(null));
      }
    }, SESSION_CHECK_INTERVAL);

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, []);

  // Update lockout timer
  const updateLockoutTimer = useCallback((lockedUntil: number) => {
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, lockedUntil - Date.now());
      setLockoutRemaining(remaining);
      setIsLocked(remaining > 0);

      if (remaining <= 0 && lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }
    };

    updateRemaining();
    lockoutTimerRef.current = setInterval(updateRemaining, 1000);
  }, []);

  const checkRateLimit = useCallback(
    (email: string): { allowed: boolean; message: string } => {
      const state = getRateLimitState(email);
      const now = Date.now();

      // Check if currently locked out
      if (state.lockedUntil > now) {
        updateLockoutTimer(state.lockedUntil);
        return {
          allowed: false,
          message: `Account locked. Try again in ${Math.ceil(
            (state.lockedUntil - now) / 60000
          )} minutes`,
        };
      }

      // Reset if outside rate limit window
      if (now - state.firstAttempt > RATE_LIMIT_WINDOW) {
        state.attempts = 0;
        state.firstAttempt = now;
      }

      return { allowed: true, message: "" };
    },
    [updateLockoutTimer]
  );

  const recordFailedAttempt = useCallback(
    (email: string): void => {
      const state = getRateLimitState(email);
      const now = Date.now();

      // Reset window if expired
      if (now - state.firstAttempt > RATE_LIMIT_WINDOW) {
        state.attempts = 1;
        state.firstAttempt = now;
      } else {
        state.attempts++;
      }

      // Check if should lock out
      if (state.attempts >= MAX_LOGIN_ATTEMPTS) {
        state.lockedUntil = now + LOCKOUT_DURATION;
        updateLockoutTimer(state.lockedUntil);
      }

      setRateLimitState(email, state);
    },
    [updateLockoutTimer]
  );

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check rate limiting
    const rateCheck = checkRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return false;
    }

    setLoading(true);
    try {
      // Delete any existing sessions first for security
      try {
        await account.deleteSession("current");
      } catch {
        // Ignore - no existing session
      }

      await account.createEmailPasswordSession(sanitizedEmail, password);
      const currentUser = await account.get();
      setUser(currentUser);

      // Clear rate limit on successful login
      clearRateLimitState(sanitizedEmail);
      setIsLocked(false);
      setLockoutRemaining(0);

      // Store session metadata for security tracking
      storeSessionMetadata(currentUser.$id);

      // Clear logout flag to allow normal session checks
      clearLogoutFlag();

      // Log successful login
      logSecurityEvent("LOGIN_SUCCESS", {
        userId: currentUser.$id,
        email: sanitizedEmail,
      });

      return true;
    } catch (err: unknown) {
      recordFailedAttempt(sanitizedEmail);
      const errorMessage = parseAuthError(err);
      setError(errorMessage);

      // Log failed login
      logSecurityEvent("LOGIN_FAILURE", {
        email: sanitizedEmail,
        metadata: { reason: errorMessage },
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setError(null);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = sanitizeInput(name);

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate name
    if (!isValidName(sanitizedName)) {
      setError("Please enter a valid name (letters, spaces, hyphens only)");
      return false;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return false;
    }

    // Check rate limiting
    const rateCheck = checkRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return false;
    }

    setLoading(true);
    try {
      await account.create(
        ID.unique(),
        sanitizedEmail,
        password,
        sanitizedName
      );
      await account.createEmailPasswordSession(sanitizedEmail, password);
      const currentUser = await account.get();
      setUser(currentUser);

      // Create user profile in database (id = auth user id)
      try {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.USERS,
          currentUser.$id,
          {
            email: currentUser.email,
            name: currentUser.name || sanitizedName,
            plan: "free",
          }
        );
      } catch (profileErr) {
        // Ignore conflict if profile already exists
        if (
          !(profileErr instanceof AppwriteException && profileErr.code === 409)
        ) {
          // Profile creation failed but auth succeeded - non-critical
        }
      }

      // Clear rate limit on successful signup
      clearRateLimitState(sanitizedEmail);

      // Store session metadata for security tracking
      storeSessionMetadata(currentUser.$id);

      // Clear logout flag
      clearLogoutFlag();

      // Log successful signup
      logSecurityEvent("SIGNUP_SUCCESS", {
        userId: currentUser.$id,
        email: sanitizedEmail,
      });

      return true;
    } catch (err: unknown) {
      recordFailedAttempt(sanitizedEmail);
      const errorMessage = parseAuthError(err);
      setError(errorMessage);

      // Log failed signup
      logSecurityEvent("SIGNUP_FAILURE", {
        email: sanitizedEmail,
        metadata: { reason: errorMessage },
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const currentUserId = user?.$id;
    setLoading(true);

    try {
      // Set logout flag FIRST to prevent auto-login
      setLogoutFlag();

      // Clear all application caches
      clearAllCaches();

      // Try to delete all sessions for complete logout
      try {
        await account.deleteSessions();
      } catch {
        // Fallback to current session only
        try {
          await account.deleteSession("current");
        } catch {
          // Session might already be invalid
        }
      }

      setUser(null);
      setError(null);

      // Log security event
      logSecurityEvent("LOGOUT", { userId: currentUserId });
    } catch {
      // Force clear user state even if API fails
      setUser(null);
      clearAllCaches();
    } finally {
      setLoading(false);
    }
  };

  // Send password recovery using Magic URL token
  // This sends an email with a clickable link containing userId and secret
  const sendPasswordRecovery = async (
    email: string
  ): Promise<{ success: boolean; userId?: string } | null> => {
    setError(null);

    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    if (!isValidEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return null;
    }

    setLoading(true);
    try {
      // Use createMagicURLToken which sends a link with userId and secret
      // User can copy the secret from the URL or click the link
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000");
      const recoveryUrl = `${baseUrl}/reset-password`;

      const result = await account.createMagicURLToken(
        ID.unique(),
        sanitizedEmail,
        recoveryUrl,
        false // phrase = false
      );

      return { success: true, userId: result.userId };
    } catch (err: unknown) {
      const errorMessage = parseAuthError(err);
      // Don't reveal if email exists or not for security
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("Invalid") ||
        errorMessage.includes("already")
      ) {
        setError(
          "If an account exists with this email, a reset link has been sent."
        );
        return null;
      }
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify secret from Magic URL and reset password
  const resetPassword = async (
    userId: string,
    secret: string,
    password: string
  ): Promise<boolean> => {
    setError(null);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return false;
    }

    // Ensure secret is trimmed and has no spaces
    const cleanSecret = secret.trim();

    setLoading(true);
    try {
      // First, delete any existing sessions to avoid "session is active" error
      try {
        await account.deleteSessions();
      } catch {
        // Ignore error if no session exists
      }

      // Use updateMagicURLSession to verify the magic URL token and create session
      await account.updateMagicURLSession(userId, cleanSecret);

      // Now that user is logged in, update their password
      await account.updatePassword(password);

      // Get the logged in user
      const loggedInUser = await account.get();
      setUser(loggedInUser);

      return true;
    } catch (err: unknown) {
      const errorMessage = parseAuthError(err);
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Invalid") ||
        errorMessage.includes("incorrect") ||
        errorMessage.includes("Param") ||
        errorMessage.includes("prohibited")
      ) {
        setError("Invalid or expired code. Please request a new reset link.");
      } else {
        setError(errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    sendPasswordRecovery,
    resetPassword,
    isAuthenticated: !!user,
    isLocked,
    lockoutRemaining,
    clearError,
  };
}

export { AuthContext };
export type { AuthContextType };
