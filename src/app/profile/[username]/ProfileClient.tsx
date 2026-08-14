"use client";
import { useState } from "react";
import Link from "next/link";
import { Settings, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ReviewResponse } from "@/lib/api";

function getScoreColor(score: number, isCritic: boolean) {
  const normalized = isCritic ? score : score * 10;
  if (!normalized || normalized === 0) return "bg-joint-gray";
  if (normalized >= 75) return "bg-joint-green";
  if (normalized >= 50) return "bg-joint-yellow";
  return "bg-joint-red";
}

// Progress Bar Helper
function DistRow({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const progress = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 w-full py-1">
      <span className="w-8 text-xs font-bold text-gray-900 dark:text-white">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${progress}%` }} />
      </div>
      <span className="w-6 text-xs text-right text-gray-500">{count}</span>
    </div>
  );
}

// Profile Review Card
function ProfileReviewCard({ review, isCritic }: { review: ReviewResponse; isCritic: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const commentText = review.comment || "";
  const isLong = commentText.length > 150;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm mb-4">
      <div className="text-xs text-gray-500 mb-2">{new Date(review.createdAt).toLocaleDateString()}</div>
      
      <Link href={`/games/${review.gameId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-3 group">
        <div className={`w-8 h-8 flex items-center justify-center text-white font-bold text-xs shrink-0 ${isCritic ? 'rounded' : 'rounded-full'} ${getScoreColor(review.score, isCritic)}`}>
          {review.score}
        </div>
        <span className="text-lg font-bold text-[#2D9CDB] group-hover:underline truncate">
          {review.gameTitle || `Game #${review.gameId}`}
        </span>
      </Link>

      {commentText && (
        <div className="flex flex-col items-start">
          <p className={`text-sm text-gray-800 dark:text-gray-300 break-words whitespace-pre-wrap leading-relaxed ${!expanded ? "line-clamp-4" : ""}`}>
            {commentText}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-[#4DA6FF] text-xs font-bold mt-2 hover:underline">
              {expanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfileClient({ targetUsername }: { targetUsername: string }) {
  const {
    isCurrentUser, profile, displayReviews, isLoading, error,
    currentFilter, setCurrentFilter, currentSort, setCurrentSort,
    isCritic, stats
  } = useProfile(targetUsername);

  if (isLoading) {
    return <div className="flex-1 flex justify-center mt-20"><Loader2 className="animate-spin text-joint-green" size={40} /></div>;
  }

  if (error || !profile) {
    return <div className="flex-1 flex justify-center mt-20 font-bold text-joint-red">{error || "User not found"}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-center px-2 pt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{profile.username}</h1>
            {profile.isBanned && (
              <span className="bg-joint-red text-white text-xs font-bold px-2 py-0.5 rounded">BANNED</span>
            )}
          </div>
          <span className="text-sm text-gray-500 mt-1">
            Member Since {new Date(profile.createdAt).getFullYear()}
          </span>
        </div>

        {isCurrentUser && (
          <Link href="/settings" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
            <Settings size={24} />
          </Link>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* 2. STATS CARD */}
      <div className="px-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Review Stats</h2>
        
        {stats.total === 0 ? (
          <p className="text-gray-500">No reviews published yet.</p>
        ) : (
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            
            <div className="flex flex-col md:flex-row p-6 items-center gap-8">
              {/* Avg Score Box */}
              <div className={`w-24 h-24 shrink-0 flex flex-col items-center justify-center text-white shadow-inner ${isCritic ? 'rounded-xl' : 'rounded-full'} ${getScoreColor(Math.round(stats.avgRaw), isCritic)}`}>
                <span className="text-3xl font-black">{isCritic ? Math.round(stats.avgRaw) : stats.avgRaw.toFixed(1)}</span>
                <span className="text-[10px] font-bold tracking-wider">AVG</span>
              </div>

              {/* Distribution */}
              <div className="flex-1 w-full">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Distribution</h3>
                <DistRow label="Pos" count={stats.posCount} total={stats.total} colorClass="bg-joint-green" />
                <DistRow label="Mix" count={stats.mixCount} total={stats.total} colorClass="bg-joint-yellow" />
                <DistRow label="Neg" count={stats.negCount} total={stats.total} colorClass="bg-joint-red" />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800 mx-6" />

            {/* Highest / Lowest */}
            <div className="grid grid-cols-2 p-6 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Highest Rated</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold ${isCritic ? 'rounded-sm' : 'rounded-full'} ${getScoreColor(stats.highest?.score || 0, isCritic)}`}>
                    {stats.highest?.score}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{stats.highest?.gameTitle || "-"}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Lowest Rated</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold ${isCritic ? 'rounded-sm' : 'rounded-full'} ${getScoreColor(stats.lowest?.score || 0, isCritic)}`}>
                    {stats.lowest?.score}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{stats.lowest?.gameTitle || "-"}</span>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* 3. REVIEWS FEED */}
      <div className="px-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reviews ({displayReviews.length})</h2>
        
        {stats.total > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <select value={currentFilter} onChange={(e) => setCurrentFilter(e.target.value)} className="bg-gray-100 dark:bg-[#222] text-gray-900 dark:text-white text-sm font-semibold py-1.5 px-3 rounded border border-gray-300 dark:border-gray-700 outline-none">
              <option value="all">All Scores</option>
              <option value="green">Positive</option>
              <option value="yellow">Mixed</option>
              <option value="red">Negative</option>
            </select>
            <select value={currentSort} onChange={(e) => setCurrentSort(e.target.value)} className="bg-gray-100 dark:bg-[#222] text-gray-900 dark:text-white text-sm font-semibold py-1.5 px-3 rounded border border-gray-300 dark:border-gray-700 outline-none">
              <option value="date-desc">Newest</option>
              <option value="desc">Highest</option>
              <option value="asc">Lowest</option>
            </select>
          </div>
        )}

        <div className="flex flex-col">
          {displayReviews.map(review => (
            <ProfileReviewCard key={review.id} review={review} isCritic={isCritic} />
          ))}
        </div>
      </div>

    </div>
  );
}