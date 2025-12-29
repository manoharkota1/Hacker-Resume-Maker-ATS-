"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/appwrite/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Password strength indicator
function getPasswordStrength(password: string): {
  strength: number;
  label: string;
  color: string;
} {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
  if (strength <= 4)
    return { strength: 2, label: "Medium", color: "bg-yellow-500" };
  return { strength: 3, label: "Strong", color: "bg-emerald-500" };
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const router = useRouter();
  const {
    login,
    signup,
    error,
    loading,
    isLocked,
    lockoutRemaining,
    clearError,
  } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Format lockout time remaining
  const formatLockoutTime = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  if (!isOpen) return null;

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Check if locked out
    if (isLocked) {
      setLocalError(
        `Too many attempts. Please wait ${formatLockoutTime(lockoutRemaining)}`
      );
      return;
    }

    // Basic validation
    if (!email || !password) {
      setLocalError("Please fill in all required fields");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    if (isSignup) {
      if (!name || name.trim().length < 2) {
        setLocalError("Please enter your full name (at least 2 characters)");
        return;
      }

      if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        setLocalError(
          "Name can only contain letters, spaces, hyphens, and apostrophes"
        );
        return;
      }

      if (password.length < 8) {
        setLocalError("Password must be at least 8 characters");
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setLocalError("Password must contain at least one uppercase letter");
        return;
      }

      if (!/[a-z]/.test(password)) {
        setLocalError("Password must contain at least one lowercase letter");
        return;
      }

      if (!/[0-9]/.test(password)) {
        setLocalError("Password must contain at least one number");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }

      if (!agreedToTerms) {
        setLocalError("Please agree to the Terms of Service");
        return;
      }
    }

    let success = false;
    if (isSignup) {
      success = await signup(email, password, name);
    } else {
      success = await login(email, password);
    }

    if (success) {
      onSuccess?.();
      onClose();
      // Redirect to dashboard after successful login/signup
      router.push("/dashboard");
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setLocalError("");
    setShowPassword(false);
    setAgreedToTerms(false);
    clearError();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl mx-4">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
            <svg
              className="h-7 w-7 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isSignup
              ? "Sign up to save and manage your resumes"
              : "Login to access your saved resumes"}
          </p>
        </div>

        {/* Lockout Warning */}
        {isLocked && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Account temporarily locked
                </p>
                <p className="text-xs text-amber-600">
                  Try again in {formatLockoutTime(lockoutRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-black transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="John Doe"
                autoComplete="name"
                maxLength={100}
                disabled={isLocked}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-black transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              disabled={isLocked}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-black transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                maxLength={128}
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength indicator for signup */}
            {isSignup && password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 3) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.strength === 1
                        ? "text-red-600"
                        : passwordStrength.strength === 2
                        ? "text-yellow-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Use 8+ chars with uppercase, lowercase & numbers
                </p>
              </div>
            )}
          </div>

          {/* Confirm password for signup */}
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-black transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                }`}
                placeholder="••••••••"
                autoComplete="new-password"
                maxLength={128}
                disabled={isLocked}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          {/* Terms checkbox for signup */}
          {isSignup && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                disabled={isLocked}
              />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-slate-900 underline hover:no-underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-slate-900 underline hover:no-underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          {(localError || error) && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-start gap-2">
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{localError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </span>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setLocalError("");
              setPassword("");
              setConfirmPassword("");
              clearError();
            }}
            className="font-semibold text-black underline underline-offset-2 hover:text-slate-800"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
