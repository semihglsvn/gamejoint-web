import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { useAuth } from "@/context/AuthContext";
import { loginUser, oauthLogin } from "@/lib/auth";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const isJustVerified = searchParams.get("verified") === "true";
  const turnstileRef = useRef<TurnstileInstance>(null); 

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError("Please enter both credentials.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginUser(usernameOrEmail.trim(), password, turnstileToken);
      await login();
      router.push("/");
    } catch (err: any) {
      if (err.message === "UNVERIFIED") {
        sessionStorage.setItem("verifyEmail", usernameOrEmail.trim());
        router.push("/verify");
      } else {
        setError(err.message || "An unexpected error occurred.");
        turnstileRef.current?.reset(); 
        setTurnstileToken(""); 
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    if (!turnstileToken) {
      setError("Please complete the Turnstile check before using Google.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await oauthLogin("GOOGLE", credentialResponse.credential, turnstileToken);
      
      if (res.isNewUser) {
        sessionStorage.setItem("oauthEmail", res.email!);
        sessionStorage.setItem("oauthToken", credentialResponse.credential);
        router.push("/oauth/complete");
      } else {
        await login();
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Google Login failed.");
      turnstileRef.current?.reset();
      setIsLoading(false);
    }
  };

  return {
    usernameOrEmail, setUsernameOrEmail,
    password, setPassword,
    setTurnstileToken,
    isLoading,
    error, setError,
    isJustVerified,
    turnstileRef,
    handleStandardLogin,
    handleGoogleSuccess
  };
}