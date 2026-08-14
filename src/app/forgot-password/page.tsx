"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const {
    email, setEmail,
    setTurnstileToken,
    isLoading,
    error, setError,
    turnstileRef,
    handleResetRequest
  } = useForgotPassword();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto my-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Reset Password</h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Enter your email address and we will send you a 6-digit code to reset your password.
      </p>

      <form onSubmit={handleResetRequest} className="w-full flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
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

        {error && <div className="text-joint-red text-sm font-semibold text-center">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center my-4">
            <Loader2 className="animate-spin text-joint-green" size={32} />
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-joint-green hover:bg-opacity-90 text-white font-bold py-3 rounded mt-2 transition-colors"
          >
            Send Reset Code
          </button>
        )}
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="text-joint-green font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}