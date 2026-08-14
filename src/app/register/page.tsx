"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { GoogleLogin } from '@react-oauth/google';
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const {
    username, setUsername,
    email, setEmail,
    dob, setDob,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    acceptedTerms, setAcceptedTerms,
    setTurnstileToken,
    isLoading,
    error, setError,
    turnstileRef,
    handleRegister,
    handleGoogleSuccess
  } = useRegister();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto my-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Create an Account
      </h1>

      <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => { setDob(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => { setAcceptedTerms(e.target.checked); setError(null); }}
            className="w-4 h-4 text-joint-green border-gray-300 rounded focus:ring-joint-green accent-[#55C72E]"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the{" "}
            <Link href="/privacy" target="_blank" className="text-joint-green hover:underline font-semibold">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="flex justify-center my-2">
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              options={{ theme: "auto" }}
            />
          ) : (
            <div className="text-sm text-red-500">Turnstile Site Key missing</div>
          )}
        </div>

        {error && (
          <div className="text-joint-red text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center my-4">
            <Loader2 className="animate-spin text-joint-green" size={32} />
          </div>
        ) : (
          <>
            <button
              type="submit"
              className="w-full bg-joint-green hover:bg-opacity-90 text-white font-bold py-3 rounded mt-2 transition-colors"
            >
              Register Now
            </button>

            <div className="flex items-center justify-center my-4 gap-2">
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
              <span className="text-xs text-gray-500 font-semibold uppercase">OR</span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In was cancelled or failed.")}
              />
            </div>
          </>
        )}
      </form>

      <div className="mt-8 text-center">
        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
        <Link href="/login" className="text-joint-green font-bold hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
}