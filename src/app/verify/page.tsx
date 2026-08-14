"use client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useVerify } from "@/hooks/useVerify";

export default function VerifyPage() {
  const {
    email,
    isPasswordReset,
    otp, setOtp,
    setTurnstileToken,
    isLoading,
    isSuccess,
    error, setError,
    resendMessage,
    turnstileRef,
    inputRef,
    handleResend
  } = useVerify();

  if (!email) {
    return <div className="flex-1 flex justify-center mt-20"><Loader2 className="animate-spin text-joint-green" size={32} /></div>;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-12 p-6 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="text-joint-green w-20 h-20 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Verified!</h2>
        <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-12 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        {isPasswordReset ? "Reset Password" : "Verify Account"}
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        We sent a 6-digit code to:<br/>
        <span className="font-bold text-gray-900 dark:text-white">{email}</span>
      </p>

      <div className="relative mb-6" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ""); 
            setOtp(val);
            setError(null);
          }}
          className="absolute inset-0 opacity-0 cursor-text w-full h-full z-10"
          disabled={isLoading}
          autoFocus
        />

        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const char = otp[index] || "";
            const isFocused = index === otp.length;
            const hasError = error !== null;

            let borderColor = "border-gray-300 dark:border-gray-600";
            if (hasError) borderColor = "border-joint-red";
            else if (isFocused) borderColor = "border-joint-green ring-1 ring-joint-green";

            return (
              <div key={index} className={`w-12 h-12 flex items-center justify-center border-2 rounded-md bg-transparent text-xl font-bold text-gray-900 dark:text-white transition-colors ${borderColor}`}>
                {char}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center my-4">
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            options={{ theme: "auto" }}
          />
        )}
      </div>

      {error && <div className="text-joint-red text-sm font-semibold mb-4 text-center">{error}</div>}
      {resendMessage && <div className="text-joint-green text-sm font-semibold mb-4 text-center">{resendMessage}</div>}

      {isLoading ? (
        <Loader2 className="animate-spin text-joint-green mb-4" size={32} />
      ) : (
        <button onClick={handleResend} className="text-joint-green hover:underline text-sm font-semibold">
          Didn't receive a code? Resend
        </button>
      )}
    </div>
  );
}