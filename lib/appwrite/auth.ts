"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { account, ID } from "./config";
import { Models, AppwriteException } from "appwrite";

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
      const currentUser = await account.get();
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
        account
          .get()
          .then(setUser)
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

      return true;
    } catch (err: unknown) {
      recordFailedAttempt(sanitizedEmail);
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
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

      // Clear rate limit on successful signup
      clearRateLimitState(sanitizedEmail);

      return true;
    } catch (err: unknown) {
      recordFailedAttempt(sanitizedEmail);
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try to delete all sessions for complete logout
      try {
        await account.deleteSessions();
      } catch {
        // Fallback to current session only
        await account.deleteSession("current");
      }

      setUser(null);
      setError(null);

      // Clear any cached auth data
      if (typeof window !== "undefined") {
        // Clear only auth-related storage, not user data
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("auth_rate_")) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
      // Force clear user state even if API fails
      setUser(null);
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
    isAuthenticated: !!user,
    isLocked,
    lockoutRemaining,
    clearError,
  };
}

export { AuthContext };
export type { AuthContextType };
