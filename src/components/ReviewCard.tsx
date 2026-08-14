"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ReviewResponse } from "@/lib/api";

function getScoreColor(score: number, isCritic: boolean) {
  const normalized = isCritic ? score : score * 10;
  if (normalized >= 75) return "bg-joint-green";
  if (normalized >= 50) return "bg-joint-yellow";
  return "bg-joint-red";
}

interface ReviewCardProps {
  review: ReviewResponse;
  isCritic: boolean;
  isAuthenticated: boolean;
  currentUserRole: number;
  isBanned: boolean;
  onReport: () => void;
  onBan: () => void;
}

export default function ReviewCard({ review, isCritic, isAuthenticated, currentUserRole, isBanned, onReport, onBan }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const commentText = review.comment || "";
  const isLongText = commentText.length > 150;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-sm flex flex-col min-h-[160px]">
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 ${isCritic ? 'rounded' : 'rounded-full'} ${getScoreColor(review.score, isCritic)}`}>
            {review.score}
          </div>
          <div className="min-w-0">
            <Link href={`/profile/${review.authorUsername}`} className="font-bold text-[#2D9CDB] hover:underline truncate block">
              {review.authorUsername}
            </Link>
            <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {isAuthenticated && currentUserRole >= 1 && currentUserRole <= 3 ? (
            <button onClick={onBan} className="bg-red-100 text-red-600 dark:bg-[#331111] dark:text-[#ff3333] text-xs font-bold px-2 py-1 rounded hover:bg-red-200 transition-colors shrink-0 ml-2">
              BAN
            </button>
        ) : isAuthenticated && !isBanned && (
            <button onClick={onReport} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-2">
              <AlertTriangle size={18} />
            </button>
        )}
      </div>
      
      {/* break-words and whitespace-pre-wrap fix the overflow bug */}
      <div className="flex-1 flex flex-col justify-start">
        <p className={`text-sm text-gray-800 dark:text-gray-300 break-words whitespace-pre-wrap leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
          {commentText}
        </p>
        
        {isLongText && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-[#4DA6FF] text-xs font-bold mt-2 self-start hover:underline"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
}