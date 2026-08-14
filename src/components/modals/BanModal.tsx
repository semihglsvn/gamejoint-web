"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface BanModalProps {
  username: string;
  onClose: () => void;
  onSubmit: (durationDays: number | null, reason: string) => Promise<void>;
}

export default function BanModal({ username, onClose, onSubmit }: BanModalProps) {
  const [duration, setDuration] = useState<number | null>(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(duration, reason);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-joint-red">Ban {username}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Reason (Optional)</label>
            <input 
              type="text" 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-joint-red text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="duration" checked={duration === 1} onChange={() => setDuration(1)} className="w-4 h-4 accent-joint-red" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">24 Hours</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="duration" checked={duration === 7} onChange={() => setDuration(7)} className="w-4 h-4 accent-joint-red" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">7 Days</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="duration" checked={duration === null} onChange={() => setDuration(null)} className="w-4 h-4 accent-joint-red" />
              <span className="text-joint-red font-bold">Permanent</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#222] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-6 py-2 bg-joint-red hover:bg-opacity-90 text-white font-bold rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Executing..." : "Execute Ban"}
          </button>
        </div>
      </div>
    </div>
  );
}