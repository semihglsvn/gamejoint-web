import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getGameReviews, submitReview, updateReview, deleteReview, submitReport, banUser, ReviewResponse } from "@/lib/api";

export function useGameDetail(gameId: number) {
  const { user, isAuthenticated } = useAuth();
  
  // RAW State
  const [rawUserReviews, setRawUserReviews] = useState<ReviewResponse[]>([]);
  const [rawCriticReviews, setRawCriticReviews] = useState<ReviewResponse[]>([]);
  
  // PROCESSED State (Filtered & Sorted)
  const [userReviews, setUserReviews] = useState<ReviewResponse[]>([]);
  const [criticReviews, setCriticReviews] = useState<ReviewResponse[]>([]);
  
  // Metrics & Auth Info
  const [avgUserScore, setAvgUserScore] = useState<number | null>(null);
  const [existingReviewId, setExistingReviewId] = useState<number | null>(null);
  const currentUserRole = user?.role === "CRITIC" ? 4 : (user?.role === "MODERATOR" ? 2 : 5); // Adapt to your exact role logic
  const isBanned = false; // Assuming your /auth/me endpoint doesn't return users if they are banned

  // Draft State
  const [draftScore, setDraftScore] = useState<number>(0);
  const [draftText, setDraftText] = useState("");

  // Sort & Filter
  const [currentSort, setCurrentSort] = useState("date-desc");
  const [currentFilter, setCurrentFilter] = useState("all");

  // Modals & Action Targets
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [targetReviewId, setTargetReviewId] = useState<number | null>(null);
  const [targetUsername, setTargetUsername] = useState("");

  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // --- DATA LOADING ---
  const loadReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const [uReviews, cReviews] = await Promise.all([
        getGameReviews(gameId, 5, 50), // Role 5 = User
        getGameReviews(gameId, 4, 50)  // Role 4 = Critic
      ]);

      setRawUserReviews(uReviews);
      setRawCriticReviews(cReviews);

      if (uReviews.length > 0) {
        const avg = uReviews.reduce((acc, rev) => acc + rev.score, 0) / uReviews.length;
        setAvgUserScore(avg);
      } else {
        setAvgUserScore(null);
      }

      // Check for existing review
      if (user?.username) {
        const allRevs = [...uReviews, ...cReviews];
        const myRev = allRevs.find(r => r.authorUsername.toLowerCase() === user.username.toLowerCase());
        if (myRev) {
          setExistingReviewId(myRev.id);
          setDraftScore(myRev.score);
          setDraftText(myRev.comment || "");
        } else {
          setExistingReviewId(null);
          // Load local draft
          const savedText = localStorage.getItem(`draft_${gameId}_text`) || "";
          const savedScore = parseInt(localStorage.getItem(`draft_${gameId}_score`) || "0", 10);
          setDraftText(savedText);
          setDraftScore(savedScore);
        }
      }
    } catch (e) {
      console.error("Failed to load reviews", e);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [gameId, user?.username]);

  // --- SORTING & FILTERING ---
  useEffect(() => {
    const getNormalized = (score: number, isCritic: boolean) => isCritic ? score : score * 10;

    const processList = (list: ReviewResponse[], isCritic: boolean) => {
      let processed = [...list];

      // Filter
      if (currentFilter === "green") processed = processed.filter(r => getNormalized(r.score, isCritic) >= 75);
      if (currentFilter === "yellow") processed = processed.filter(r => getNormalized(r.score, isCritic) >= 50 && getNormalized(r.score, isCritic) < 75);
      if (currentFilter === "red") processed = processed.filter(r => getNormalized(r.score, isCritic) < 50);

      // Sort
      processed.sort((a, b) => {
        if (currentSort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (currentSort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (currentSort === "desc") return getNormalized(b.score, isCritic) - getNormalized(a.score, isCritic);
        if (currentSort === "asc") return getNormalized(a.score, isCritic) - getNormalized(b.score, isCritic);
        return 0;
      });

      return processed;
    };

    setUserReviews(processList(rawUserReviews, false));
    setCriticReviews(processList(rawCriticReviews, true));
  }, [rawUserReviews, rawCriticReviews, currentFilter, currentSort]);

  // --- ACTIONS ---
  const handleSaveDraft = (text: string, score: number) => {
    setDraftText(text);
    setDraftScore(score);
    if (!existingReviewId) {
      localStorage.setItem(`draft_${gameId}_text`, text);
      localStorage.setItem(`draft_${gameId}_score`, score.toString());
    }
  };

  const handlePostReview = async (text: string, score: number) => {
    try {
      if (existingReviewId) {
        await updateReview(existingReviewId, score, text);
      } else {
        await submitReview(gameId, score, text);
        localStorage.removeItem(`draft_${gameId}_text`);
        localStorage.removeItem(`draft_${gameId}_score`);
      }
      setShowReviewModal(false);
      loadReviews();
    } catch (e) {
      alert("Failed to submit review. You might be rated limited or banned.");
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReviewId) return;
    try {
      await deleteReview(existingReviewId);
      setExistingReviewId(null);
      setDraftScore(0);
      setDraftText("");
      loadReviews();
    } catch (e) {
      alert("Failed to delete review.");
    }
  };

  const handleReport = async (reasons: string[]) => {
    if (!targetReviewId) return;
    try {
      await submitReport(targetReviewId, reasons);
      setShowReportModal(false);
      alert("Report submitted.");
    } catch (e) {
      alert("Failed to submit report.");
    }
  };

  const handleBan = async (durationDays: number | null, reason: string) => {
    // Assuming targetReviewId points to the user id conceptually for MVP, 
    // or you add targetUserId state if your API requires authorId specifically
    if (!targetReviewId) return; 
    try {
      await banUser(targetReviewId, durationDays, reason);
      setShowBanModal(false);
      alert("User banned.");
      loadReviews();
    } catch (e) {
      alert("Failed to ban user.");
    }
  };

  return {
    isAuthenticated,
    isBanned,
    currentUserRole,
    isLoadingReviews,
    userReviews,
    criticReviews,
    avgUserScore,
    currentSort, setCurrentSort,
    currentFilter, setCurrentFilter,
    existingReviewId,
    draftScore, draftText, handleSaveDraft,
    
    showReviewModal, setShowReviewModal,
    showReportModal, setShowReportModal,
    showBanModal, setShowBanModal,
    
    setTargetReviewId,
    setTargetUsername,
    targetUsername,
    
    loadReviews,
    handlePostReview,
    handleDeleteReview,
    handleReport,
    handleBan
  };
}