import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { executePasswordReset } from "@/lib/auth";

export function useNewPassword() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verifyEmail");
    const storedOtp = sessionStorage.getItem("resetOtp");
    
    if (!storedEmail || !storedOtp) {
      router.push("/login"); // Security Kick
    } else {
      setEmail(storedEmail);
      setOtp(storedOtp);
    }
  }, [router]);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await executePasswordReset(email!, otp!, newPassword, turnstileToken);
      setIsSuccess(true);
      
      // Clean up sensitive data from memory
      sessionStorage.removeItem("verifyEmail");
      sessionStorage.removeItem("verifyType");
      sessionStorage.removeItem("resetOtp");
      
      setTimeout(() => {
        router.push("/login"); 
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The session may have expired.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
    }
  };

  return {
    email, otp,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    setTurnstileToken,
    isLoading, isSuccess,
    error, setError,
    turnstileRef,
    handlePasswordReset
  };
}