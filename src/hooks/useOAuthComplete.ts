import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { completeOAuthRegistration } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export function useOAuthComplete() {
  const router = useRouter();
  const { login } = useAuth();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [email, setEmail] = useState<string | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("oauthEmail");
    const storedToken = sessionStorage.getItem("oauthToken");
    if (!storedEmail || !storedToken) {
      router.push("/login"); // Kick them out if accessed directly
    } else {
      setEmail(storedEmail);
      setProviderToken(storedToken);
    }
  }, [router]);

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acceptedTerms) return setError("You must agree to the Privacy Policy.");
    if (!username.trim() || !dob.trim()) return setError("All fields are required.");
    if (!turnstileToken) return setError("Please complete the security check.");
    
    const year = new Date(dob).getFullYear();
    if (isNaN(year) || year < 1900 || year >= new Date().getFullYear()) {
      return setError("Please enter a valid birth year.");
    }

    setIsLoading(true);
    setError(null);

    try {
      await completeOAuthRegistration(
        "GOOGLE", 
        providerToken!, 
        username.trim(), 
        dob, 
        turnstileToken
      );

      // Clean up memory
      sessionStorage.removeItem("oauthEmail");
      sessionStorage.removeItem("oauthToken");
      
      // Update the AuthContext to read the newly issued HttpOnly Cookie
      await login();
      router.push("/");

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
    }
  };

  return {
    email,
    username, setUsername,
    dob, setDob,
    acceptedTerms, setAcceptedTerms,
    setTurnstileToken,
    isLoading,
    error, setError,
    turnstileRef,
    handleComplete
  };
}