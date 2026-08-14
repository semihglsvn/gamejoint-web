"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { GameDetail, formatImageUrl } from "@/lib/api";
import { useGameDetail } from "@/hooks/useGameDetail";

import ReviewCard from "@/components/ReviewCard";
import ReviewModal from "@/components/modals/ReviewModal";
import ReportModal from "@/components/modals/ReportModal";
import BanModal from "@/components/modals/BanModal";

function getScoreColor(score: number, isCritic: boolean) {
  const normalized = isCritic ? score : score * 10;
  if (!normalized || normalized === 0) return "bg-gray-500 dark:bg-gray-600";
  if (normalized >= 75) return "bg-joint-green";
  if (normalized >= 50) return "bg-joint-yellow";
  return "bg-joint-red";
}

export default function GameDetailClient({ game }: { game: GameDetail }) {
  const {
    isAuthenticated, isBanned, currentUserRole,
    isLoadingReviews, userReviews, criticReviews, avgUserScore,
    currentSort, setCurrentSort, currentFilter, setCurrentFilter,
    existingReviewId, draftScore, draftText, handleSaveDraft,
    showReviewModal, setShowReviewModal,
    showReportModal, setShowReportModal,
    showBanModal, setShowBanModal,
    setTargetReviewId, targetUsername, setTargetUsername,
    loadReviews, handlePostReview, handleDeleteReview, handleReport, handleBan
  } = useGameDetail(game.id!);

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const calculatedJointScore = criticReviews.length > 0 
    ? Math.round(criticReviews.reduce((acc, r) => acc + r.score, 0) / criticReviews.length) 
    : (game.metascore || 0);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HERO BANNER */}
      <div className="w-full h-[250px] md:h-[350px] relative rounded-xl overflow-hidden shadow-lg bg-gray-200 dark:bg-[#1a1a1a]">
        <Image
          src={formatImageUrl(game.coverImage)}
          alt={game.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1100px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* TITLE & GENRES */}
      <div className="flex flex-col px-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          {game.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {(game.genreNames || game.genres || []).map((genre, idx) => (
            <span key={idx} className="bg-[#2D9CDB] text-white text-xs font-bold px-3 py-1 rounded">
              {genre}
            </span>
          ))}
        </div>
        <hr className="border-gray-200 dark:border-gray-800" />
      </div>

      {/* SCORE HUB */}
      <div className="flex justify-evenly items-center py-4">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-md ${getScoreColor(calculatedJointScore, true)}`}>
            {calculatedJointScore > 0 ? calculatedJointScore : "TBD"}
          </div>
          <span className="font-bold text-gray-900 dark:text-white mt-2">JointScore</span>
          <span className="text-xs text-gray-500">
            {criticReviews.length > 0 ? `Based on ${criticReviews.length} reviews` : (calculatedJointScore > 0 ? "External DB rating" : "No reviews yet")}
          </span>
        </div>

        <div className="w-[1px] h-20 bg-gray-200 dark:bg-gray-800" />

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md ${getScoreColor(Math.round((avgUserScore || 0) * 10), true)}`}>
            {avgUserScore ? avgUserScore.toFixed(1) : "TBD"}
          </div>
          <span className="font-bold text-gray-900 dark:text-white mt-2">User Score</span>
          <span className="text-xs text-gray-500">
            {userReviews.length > 0 ? `Based on ${userReviews.length} reviews` : "No reviews yet"}
          </span>
        </div>
      </div>
      <hr className="border-gray-200 dark:border-gray-800" />

      {/* ABOUT SECTION */}
      <div className="px-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm mb-6">
          {game.developer && <div><span className="font-bold text-gray-500">Developer:</span> <span className="text-gray-900 dark:text-gray-200">{game.developer}</span></div>}
          {game.publisher && <div><span className="font-bold text-gray-500">Publisher:</span> <span className="text-gray-900 dark:text-gray-200">{game.publisher}</span></div>}
          {game.releaseDate && <div><span className="font-bold text-gray-500">Release Date:</span> <span className="text-gray-900 dark:text-gray-200">{game.releaseDate}</span></div>}
          {(game.platformNames?.length || game.platforms?.length) && <div><span className="font-bold text-gray-500">Platforms:</span> <span className="text-gray-900 dark:text-gray-200">{(game.platformNames || game.platforms)?.join(", ")}</span></div>}
        </div>
        
        <div className="relative">
          <p className={`text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
            {game.description || "No description available."}
          </p>
          {(game.description?.length || 0) > 250 && (
            <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-joint-green font-bold text-sm mt-2 hover:underline">
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 italic mt-4">Data courtesy of RAWG.io</p>
      </div>
      <hr className="border-gray-200 dark:border-gray-800" />

      {/* CONDITIONAL REVIEW BOX */}
      <div className="px-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Review</h2>
        
        {!isAuthenticated ? (
          <div className="bg-gray-100 dark:bg-[#222] rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-bold mb-3">Sign in or create an account to rate and review this game.</p>
            <Link href="/login" className="inline-block bg-joint-green text-white font-bold px-6 py-2 rounded">Login</Link>
          </div>
        ) : isBanned ? (
          <div className="bg-red-100 dark:bg-[#331111] rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-[#ff3333] font-bold">Your account has been restricted. You cannot post reviews.</p>
          </div>
        ) : (currentUserRole >= 1 && currentUserRole <= 3) ? (
          <div className="bg-gray-100 dark:bg-[#222] rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Staff members cannot write reviews.</p>
          </div>
        ) : existingReviewId ? (
          <div className="bg-gray-100 dark:bg-[#222] rounded-lg p-6 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">You have already reviewed this game.</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Score:</span>
                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getScoreColor(draftScore, currentUserRole === 4)}`}>{draftScore}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReviewModal(true)} className="text-[#2D9CDB] hover:bg-[#2D9CDB]/10 p-2 rounded-full transition-colors"><Edit size={20} /></button>
              <button onClick={() => setShowDeleteConfirm(true)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowReviewModal(true)} className="w-full bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors rounded-lg p-6 text-center font-bold text-[#2D9CDB]">
            Tap to write a review...
          </button>
        )}
      </div>

      {/* FILTERS & SORT */}
      <div className="px-2 mt-4">
        <div className="flex flex-wrap gap-3 mb-6 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-200 dark:border-gray-800">
          <select value={currentFilter} onChange={(e) => setCurrentFilter(e.target.value)} className="bg-white dark:bg-[#222] text-gray-900 dark:text-white text-sm font-semibold py-2 px-3 rounded border border-gray-300 dark:border-gray-700 outline-none flex-1 min-w-[140px]">
            <option value="all">All Scores</option>
            <option value="green">Positive</option>
            <option value="yellow">Mixed</option>
            <option value="red">Negative</option>
          </select>

          <select value={currentSort} onChange={(e) => setCurrentSort(e.target.value)} className="bg-white dark:bg-[#222] text-gray-900 dark:text-white text-sm font-semibold py-2 px-3 rounded border border-gray-300 dark:border-gray-700 outline-none flex-1 min-w-[140px]">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="desc">Highest Score</option>
            <option value="asc">Lowest Score</option>
          </select>
        </div>

        {/* SIDE-BY-SIDE REVIEW COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* LEFT COLUMN: CRITICS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
              Critic Reviews <span className="text-gray-500 text-sm font-normal">({criticReviews.length})</span>
            </h3>
            {isLoadingReviews ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-joint-green" size={32} /></div>
            ) : criticReviews.length === 0 ? (
              <div className="py-10 text-center text-gray-500 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-dashed border-gray-300 dark:border-gray-700">No critic reviews match your filters.</div>
            ) : (
              criticReviews.map((review) => (
                <ReviewCard 
                  key={`critic-${review.id}`}
                  review={review} 
                  isCritic={true} 
                  isAuthenticated={isAuthenticated} 
                  currentUserRole={currentUserRole} 
                  isBanned={isBanned}
                  onReport={() => { setTargetReviewId(review.id); setShowReportModal(true); }}
                  onBan={() => { setTargetReviewId(review.authorId); setTargetUsername(review.authorUsername); setShowBanModal(true); }}
                />
              ))
            )}
          </div>

          {/* RIGHT COLUMN: USERS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
              User Reviews <span className="text-gray-500 text-sm font-normal">({userReviews.length})</span>
            </h3>
            {isLoadingReviews ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-joint-green" size={32} /></div>
            ) : userReviews.length === 0 ? (
              <div className="py-10 text-center text-gray-500 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-dashed border-gray-300 dark:border-gray-700">No user reviews match your filters.</div>
            ) : (
              userReviews.map((review) => (
                <ReviewCard 
                  key={`user-${review.id}`}
                  review={review} 
                  isCritic={false} 
                  isAuthenticated={isAuthenticated} 
                  currentUserRole={currentUserRole} 
                  isBanned={isBanned}
                  onReport={() => { setTargetReviewId(review.id); setShowReportModal(true); }}
                  onBan={() => { setTargetReviewId(review.authorId); setTargetUsername(review.authorUsername); setShowBanModal(true); }}
                />
              ))
            )}
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}
      {showReviewModal && (
        <ReviewModal
          isCritic={currentUserRole === 4} 
          initialText={draftText}
          initialScore={draftScore}
          isEdit={!!existingReviewId}
          onClose={(text, score) => { handleSaveDraft(text, score); setShowReviewModal(false); }}
          onSubmit={handlePostReview}
        />
      )}
      
      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} onSubmit={handleReport} />}
      
      {showBanModal && <BanModal username={targetUsername} onClose={() => setShowBanModal(false)} onSubmit={handleBan} />}

      {/* Delete Confirmation Simple Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Review</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Are you sure you want to permanently delete this review?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-[#333] rounded">Cancel</button>
              <button onClick={() => { handleDeleteReview(); setShowDeleteConfirm(false); }} className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}