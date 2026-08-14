import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  getProfile, UserProfileResponse, requestSettingsOtp, 
  changeEmail, changePassword, deleteAccount, cancelDeletion 
} from "@/lib/api";

export function useSettings() {
  const router = useRouter();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, authLoading, router, loadProfile]);

  const handleRequestOtp = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      await requestSettingsOtp();
      setOtpSent(true);
      setSuccessMsg("Security code sent to your email!");
    } catch (err: any) {
      setError(err.message.includes("Too many") ? "Please wait a few minutes before requesting another code." : "Failed to send code.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeSecureAction = async (action: () => Promise<any>, requiresLogout: boolean = true) => {
    setIsActionLoading(true);
    setError(null);
    try {
      await action();
      setOtpSent(false);
      if (requiresLogout) {
        logout();
        router.push("/login");
      } else {
        loadProfile();
      }
    } catch (err: any) {
      setError(err.message.includes("Invalid") ? "Invalid or expired code." : err.message || "Action failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsActionLoading(true);
    try {
      await cancelDeletion();
      setSuccessMsg("Account deletion cancelled. Welcome back!");
      loadProfile();
    } catch (err) {
      setError("Failed to cancel deletion.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setError(null);
    setSuccessMsg(null);
  };

  return {
    profile, isLoading, isActionLoading, otpSent, error, successMsg,
    setSuccessMsg, setError,
    loadProfile, handleRequestOtp, executeSecureAction, handleCancelDeletion, resetOtpState,
    changeEmailApi: changeEmail,
    changePasswordApi: changePassword,
    deleteAccountApi: deleteAccount
  };
}