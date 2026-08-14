"use client";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import SecureActionModal from "@/components/modals/SecureActionModal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    profile, isLoading, isActionLoading, otpSent, error, successMsg, setSuccessMsg,
    handleRequestOtp, executeSecureAction, handleCancelDeletion, resetOtpState,
    changeEmailApi, changePasswordApi, deleteAccountApi 
  } = useSettings();

  const [activeModal, setActiveModal] = useState<"Email" | "Password" | "Delete" | null>(null);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg, setSuccessMsg]);

  if (isLoading || !profile) {
    return <div className="flex-1 flex justify-center mt-20"><Loader2 className="animate-spin text-joint-green" size={40} /></div>;
  }

  const handleCloseModal = () => {
    setActiveModal(null);
    resetOtpState();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center px-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {successMsg && (
        <div className="bg-joint-green/20 text-joint-green border border-joint-green/50 p-4 rounded-lg font-bold text-center">
          {successMsg}
        </div>
      )}

      {/* 1. PROFILE INFO */}
      <section>
        <h2 className="text-lg font-bold text-joint-green mb-3 px-2">Account Details</h2>
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500">Username</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{profile.username}</span>
          </div>
          <hr className="border-gray-100 dark:border-gray-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500">Email</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{profile.email}</span>
          </div>
          <hr className="border-gray-100 dark:border-gray-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500">Joined</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* 2. APPEARANCE (THEME) */}
      <section>
        <h2 className="text-lg font-bold text-joint-green mb-3 px-2">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === "system" ? "border-joint-green bg-joint-green/10 text-joint-green" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"}`}
          >
            <Monitor size={24} />
            <span className="text-sm font-bold">System</span>
          </button>
          
          <button 
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === "light" ? "border-joint-green bg-joint-green/10 text-joint-green" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"}`}
          >
            <Sun size={24} />
            <span className="text-sm font-bold">Light</span>
          </button>

          <button 
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === "dark" ? "border-joint-green bg-joint-green/10 text-joint-green" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"}`}
          >
            <Moon size={24} />
            <span className="text-sm font-bold">Dark</span>
          </button>
        </div>
      </section>

      {/* 3. ACCOUNT SECURITY */}
      <section>
        <h2 className="text-lg font-bold text-joint-green mb-3 px-2">Account Security</h2>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveModal("Email")}
            className="w-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-900 dark:text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-left px-5"
          >
            Change Email Address
          </button>
          
          <button 
            onClick={() => setActiveModal("Password")}
            className="w-full bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-900 dark:text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-left px-5"
          >
            Change Password
          </button>

          {/* DYNAMIC DELETION UI */}
          {profile.deletionDate ? (
            <div className="w-full bg-red-50 dark:bg-[#331111] border border-red-200 dark:border-red-900/50 rounded-xl p-6 flex flex-col items-center text-center mt-4 shadow-sm">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="text-joint-red" size={24} />
              </div>
              <h3 className="font-bold text-joint-red mb-2">Account Deletion Scheduled</h3>
              <p className="text-sm text-red-800 dark:text-red-200 mb-5">
                Your account is scheduled to be permanently deleted on {new Date(profile.deletionDate).toLocaleDateString()}. You will lose all data.
              </p>
              <button 
                onClick={handleCancelDeletion}
                disabled={isActionLoading}
                className="w-full bg-joint-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : "Cancel Deletion"}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveModal("Delete")}
              className="w-full bg-red-50 dark:bg-[#221111] border border-red-100 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-900 text-joint-red font-bold py-4 rounded-xl shadow-sm transition-colors flex items-center gap-3 px-5 mt-4"
            >
              <AlertTriangle size={18} />
              Delete Account
            </button>
          )}
        </div>
      </section>

      {activeModal && (
        <SecureActionModal
          title={activeModal === "Delete" ? "Delete Account" : `Change ${activeModal}`}
          actionType={activeModal}
          otpSent={otpSent}
          isLoading={isActionLoading}
          error={error}
          onRequestOtp={handleRequestOtp}
          onClose={handleCloseModal}
          onExecute={(otp, newValue) => {
            if (activeModal === "Email") executeSecureAction(() => changeEmailApi(otp, newValue));
            else if (activeModal === "Password") executeSecureAction(() => changePasswordApi(otp, newValue));
            else if (activeModal === "Delete") executeSecureAction(() => deleteAccountApi(otp));
          }}
        />
      )}
    </div>
  );
}