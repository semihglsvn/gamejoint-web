"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (reasons: string[]) => Promise<void>;
}

const PREDEFINED_REASONS = ["Spam", "Offensive Language", "Spoilers", "Harassment", "Irrelevant"];

export default function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleReason = (reason: string) => {
    const newSet = new Set(selectedReasons);
    if (newSet.has(reason)) newSet.delete(reason);
    else newSet.add(reason);
    setSelectedReasons(newSet);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(Array.from(selectedReasons));
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Please select one or more reasons:</p>
          
          {PREDEFINED_REASONS.map(reason => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedReasons.has(reason)}
                onChange={() => toggleReason(reason)}
                className="w-4 h-4 accent-joint-red cursor-pointer"
              />
              <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-joint-red transition-colors">{reason}</span>
            </label>
          ))}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#222] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={selectedReasons.size === 0 || isSubmitting}
            className="px-6 py-2 bg-joint-red hover:bg-opacity-90 text-white font-bold rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}