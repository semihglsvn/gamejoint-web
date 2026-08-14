import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { requestPasswordReset } from "@/lib/auth";

export function useForgotPassword() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim(), turnstileToken);

      sessionStorage.setItem("verifyEmail", email.trim());
      sessionStorage.setItem("verifyType", "reset");
      router.push("/verify");
      
    } catch (err: any) {
      setError(err.message || "Failed to request password reset.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    turnstileToken, setTurnstileToken,
    isLoading,
    error, setError,
    turnstileRef,
    handleResetRequest
  };
}