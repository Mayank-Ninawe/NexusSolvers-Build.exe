'use client';

/**
 * BiasBreaker Signup Page
 * Allows new users to create accounts with college email verification
 * Automatically detects college from email domain
 */

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// Types
// ============================================================================

interface FormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function SignupPage() {
  const router = useRouter();
  const { signup, error: authError, clearError } = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validates form fields and returns true if all valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate display name
    if (!displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!email.toLowerCase().endsWith('.edu')) {
      newErrors.email = 'Please use your college email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: email.toLowerCase().trim(),
        password,
        displayName: displayName.trim(),
      });

      // Redirect to student dashboard on success
      router.push('/student/dashboard');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears field error when user starts typing
   */
  const handleFieldChange = (
    field: keyof FormErrors,
    value: string,
    setter: (value: string) => void
  ) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3FF] p-4">
      <div className="w-full max-w-[450px]">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                BiasBreaker
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#1F2937] text-center mb-2">
            Create your account
          </h1>
          <p className="text-[#6B7280] text-center mb-6">
            Sign up with your college email
          </p>

          {/* Error Banner */}
          {(submitError || authError) && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-medium">
                {submitError || authError}
              </p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-[#1F2937] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) =>
                  handleFieldChange('displayName', e.target.value, setDisplayName)
                }
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none ${
                  errors.displayName
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]'
                }`}
                disabled={isLoading}
              />
              {errors.displayName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1F2937] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  handleFieldChange('email', e.target.value, setEmail)
                }
                placeholder="yourname@college.edu"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none ${
                  errors.email
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]'
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1F2937] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  handleFieldChange('password', e.target.value, setPassword)
                }
                placeholder="Create a strong password"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none ${
                  errors.password
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]'
                }`}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#1F2937] mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  handleFieldChange(
                    'confirmPassword',
                    e.target.value,
                    setConfirmPassword
                  )
                }
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                    : 'border-[#E5E7EB] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]'
                }`}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-[#6B7280]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#4F46E5] hover:text-[#7C3AED] transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[#9CA3AF]">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
