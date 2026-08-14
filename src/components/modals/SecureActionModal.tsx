"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface SecureActionModalProps {
  title: string;
  actionType: "Email" | "Password" | "Delete";
  otpSent: boolean;
  isLoading: boolean;
  error: string | null;
  onRequestOtp: () => void;
  onExecute: (otp: string, newValue: string) => void;
  onClose: () => void;
}

export default function SecureActionModal({ title, actionType, otpSent, isLoading, error, onRequestOtp, onExecute, onClose }: SecureActionModalProps) {
  const [otp, setOtp] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleSubmit = () => {
    if (!otpSent) {
      onRequestOtp();
    } else {
      onExecute(otp, newValue);
    }
  };

  const isSubmitDisabled = isLoading || (otpSent && otp.length < 6) || (otpSent && actionType !== "Delete" && newValue.length === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className={`text-xl font-bold ${actionType === "Delete" ? "text-joint-red" : "text-gray-900 dark:text-white"}`}>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && <div className="text-sm font-bold text-joint-red text-center bg-red-100 dark:bg-[#331111] py-2 rounded">{error}</div>}

          {!otpSent ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To protect your account, we need to verify your identity. We will send a 6-digit code to your registered email address.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">6-Digit Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-joint-green text-gray-900 dark:text-white tracking-widest font-mono"
                />
              </div>

              {actionType !== "Delete" ? (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">New {actionType}</label>
                  <input 
                    type={actionType === "Password" ? "password" : "email"} 
                    value={newValue} 
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-joint-green text-gray-900 dark:text-white"
                  />
                </div>
              ) : (
                <p className="text-sm font-bold text-joint-red mt-2">
                  This will schedule your account for deletion in 7 days.
                </p>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#222] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled}
            className={`px-6 py-2 flex items-center justify-center min-w-[120px] text-white font-bold rounded transition-colors disabled:opacity-50 ${actionType === 'Delete' && otpSent ? 'bg-joint-red hover:bg-red-700' : 'bg-joint-green hover:bg-opacity-90'}`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (!otpSent ? "Send Code" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}