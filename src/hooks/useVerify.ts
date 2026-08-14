import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { verifyAccount, resendVerification, requestPasswordReset } from "@/lib/auth";

export function useVerify() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [email, setEmail] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  
  const [otp, setOtp] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verifyEmail");
    const storedType = sessionStorage.getItem("verifyType");
    
    if (!storedEmail) {
      router.push("/login");
    } else {
      setEmail(storedEmail);
      setIsPasswordReset(storedType === "reset");
    }
  }, [router]);

  const submitVerification = async (code: string) => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      await verifyAccount(email, code, turnstileToken);
      setIsSuccess(true);
      
      sessionStorage.removeItem("verifyEmail");
      
      setTimeout(() => {
        router.push("/login?verified=true"); 
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
      setOtp(""); 
      turnstileRef.current?.reset();
      setTurnstileToken("");
      if (inputRef.current) inputRef.current.focus();
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (otp.length === 6 && email) {
      if (isPasswordReset) {
        sessionStorage.setItem("resetOtp", otp);
        router.push("/new-password");
      } else {
        if (!turnstileToken) {
          setError("Please complete the security check.");
          setOtp(""); 
          return;
        }
        submitVerification(otp);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, email, isPasswordReset, turnstileToken]);

  const handleResend = async () => {
    if (!email) return;
    if (!turnstileToken) {
      setError("Please complete the security check to resend.");
      return;
    }
    
    setError(null);
    setResendMessage(null);
    setIsLoading(true);
    
    try {
      if (isPasswordReset) {
        await requestPasswordReset(email, turnstileToken);
      } else {
        await resendVerification(email, turnstileToken);
      }
      setResendMessage("Code resent successfully!");
      turnstileRef.current?.reset(); 
      setTurnstileToken("");
    } catch (err: any) {
      setError("Failed to resend code. Please wait and try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}