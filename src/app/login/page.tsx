"use client";
import { Suspense } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { GoogleLogin } from '@react-oauth/google';
import { useLogin } from "@/hooks/useLogin";

function LoginForm() {
  const {
    usernameOrEmail, setUsernameOrEmail,
    password, setPassword,
    setTurnstileToken,
    isLoading,
    error, setError,
    isJustVerified,
    turnstileRef,
    handleStandardLogin,
    handleGoogleSuccess
  } = useLogin();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to GameJoint
      </h1>

      {isJustVerified && (
        <div className="w-full bg-joint-green/10 border border-joint-green text-joint-green px-4 py-3 rounded mb-6 flex items-center gap-3">
          <CheckCircle2 size={20} />
          <span className="text-sm font-semibold">Account verified successfully. You can now log in.</span>
        </div>
      )}

      <form onSubmit={handleStandardLogin} className="w-full flex flex-col gap-4">
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
            Username or Email
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => { setUsernameOrEmail(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-joint-green hover:underline">
            Forgot Password?
          </Link>
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
              Login
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
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
        <Link href="/register" className="text-joint-green font-bold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center mt-20"><Loader2 className="animate-spin text-joint-green" size={32} /></div>}>
      <LoginForm />
    </Suspense>
  );
}