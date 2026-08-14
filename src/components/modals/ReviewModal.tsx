"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ReviewModalProps {
  isCritic: boolean;
  initialText: string;
  initialScore: number;
  isEdit: boolean;
  onClose: (text: string, score: number) => void;
  onSubmit: (text: string, score: number) => Promise<void>;
}

export default function ReviewModal({ isCritic, initialText, initialScore, isEdit, onClose, onSubmit }: ReviewModalProps) {
  const maxScore = isCritic ? 100 : 10;
  const safeInitialScore = initialScore > 0 ? initialScore : (maxScore / 2);
  
  const [text, setText] = useState(initialText);
  const [score, setScore] = useState<number | "">(safeInitialScore);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getScoreColor = () => {
    const numScore = typeof score === "number" ? score : 0;
    const normalized = isCritic ? numScore : numScore * 10;
    if (normalized >= 75) return "bg-joint-green";
    if (normalized >= 50) return "bg-joint-yellow";
    return "bg-joint-red";
  };

  const handleScoreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setScore("");
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      // Clamp the value between 1 and maxScore
      if (parsed > maxScore) setScore(maxScore);
      else setScore(parsed);
    }
  };

  const handleBlur = () => {
    // If they leave the box empty, snap it to 1
    if (score === "" || score < 1) setScore(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalScore = typeof score === "number" ? score : 1;
    await onSubmit(text, finalScore);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Review" : "Write Review"}
          </h2>
          <button onClick={() => onClose(text, typeof score === "number" ? score : 1)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-300">Score:</span>
            
            <input 
            type="number"
            value={score}
            onChange={handleScoreInputChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              // Block negative signs, decimals, and 'e' (exponent)
              if (e.key === '-' || e.key === 'e' || e.key === '.') {
                e.preventDefault();
              }
            }}
            className={`${getScoreColor()} text-white w-16 h-10 text-center rounded text-xl font-black focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors hide-number-arrows`}
          />
          </div>

          <input 
            type="range" 
            min="1" 
            max={maxScore} 
            value={score === "" ? 1 : score} 
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full accent-joint-green cursor-pointer"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Your thoughts...</label>
            <textarea
              value={text}
              onChange={(e) => { if (e.target.value.length <= 2000) setText(e.target.value); }}
              className="w-full h-32 p-3 bg-gray-50 dark:bg-[#222] border border-gray-300 dark:border-gray-700 rounded resize-none focus:outline-none focus:ring-1 focus:ring-joint-green text-gray-900 dark:text-white"
            />
            <div className={`text-xs text-right ${text.length >= 2000 ? 'text-red-500' : 'text-gray-500'}`}>
              {text.length} / 2000
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#222] border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={() => onClose(text, typeof score === "number" ? score : 1)} className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || score === ""}
            className="px-6 py-2 bg-joint-green hover:bg-opacity-90 text-white font-bold rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Post Review"}
          </button>
        </div>
      </div>
    </div>
  );
}