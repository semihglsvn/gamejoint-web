import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TurnstileInstance } from "@marsidev/react-turnstile";
import { registerUser, oauthLogin } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export function useRegister() {
  const router = useRouter();
  const { login } = useAuth();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError("You must agree to the Privacy Policy to register.");
      return;
    }
    if (!username.trim() || !email.trim() || !password.trim() || !dob.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const parsedDate = new Date(dob);
      const currentYear = new Date().getFullYear();
      const year = parsedDate.getFullYear();

      if (isNaN(year)) {
        setError("Please enter a valid date format.");
        return;
      }
      if (year < 1900) {
        setError("Vampires are not allowed. Year must be after 1900.");
        return;
      }
      if (year >= currentYear) {
        setError("Time travelers are not allowed. Invalid birth year.");
        return;
      }
    } catch {
      setError("Please enter a valid date.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        dob,
        cfTurnstileResponse: turnstileToken
      }, turnstileToken);

      sessionStorage.setItem("verifyEmail", email.trim());
      router.push("/verify");
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
      setIsLoading(false);
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
      setError(err.message || "Google Registration failed.");
      turnstileRef.current?.reset();
      setIsLoading(false);
    }
  };

  return {
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
  };
}