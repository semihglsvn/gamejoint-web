"use client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNewPassword } from "@/hooks/useNewPassword";

export default function NewPasswordPage() {
  const {
    email, otp,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    setTurnstileToken,
    isLoading, isSuccess,
    error, setError,
    turnstileRef,
    handlePasswordReset
  } = useNewPassword();

  if (!email || !otp) {
    return <div className="flex-1 flex justify-center mt-20"><Loader2 className="animate-spin text-joint-green" size={32} /></div>;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-12 p-6 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="text-joint-green w-20 h-20 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset Successfully!</h2>
        <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Returning to login...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto my-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Create New Password</h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        Your identity has been verified. Please enter a strong new password below.
      </p>

      <form onSubmit={handlePasswordReset} className="w-full flex flex-col gap-4">
        
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
            className="px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:outline-none focus:border-joint-green focus:ring-1 focus:ring-joint-green transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
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
            Save & Login
          </button>
        )}
      </form>
    </div>
  );
}