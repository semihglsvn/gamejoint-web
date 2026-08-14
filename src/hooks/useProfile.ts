import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPublicProfile, getUserReviews, PublicProfileResponse, ReviewResponse } from "@/lib/api";

export function useProfile(targetUsername: string) {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [rawReviews, setRawReviews] = useState<ReviewResponse[]>([]);
  const [displayReviews, setDisplayReviews] = useState<ReviewResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("date-desc");

  const getNormalizedScore = (score: number) => score <= 10 ? score * 10 : score;

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, reviewsData] = await Promise.all([
        getPublicProfile(targetUsername),
        getUserReviews(targetUsername)
      ]);
      setProfile(profileData);
      setRawReviews(reviewsData);
    } catch (err: any) {
      setError(err.message || "User not found.");
    } finally {
      setIsLoading(false);
    }
  }, [targetUsername]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    let list = [...rawReviews];

    // Filter
    if (currentFilter === "green") list = list.filter(r => getNormalizedScore(r.score) >= 75);
    if (currentFilter === "yellow") list = list.filter(r => getNormalizedScore(r.score) >= 50 && getNormalizedScore(r.score) < 75);
    if (currentFilter === "red") list = list.filter(r => getNormalizedScore(r.score) < 50);

    // Sort
    list.sort((a, b) => {
      if (currentSort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (currentSort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (currentSort === "desc") return getNormalizedScore(b.score) - getNormalizedScore(a.score);
      if (currentSort === "asc") return getNormalizedScore(a.score) - getNormalizedScore(b.score);
      return 0;
    });

    setDisplayReviews(list);
  }, [rawReviews, currentFilter, currentSort]);

  // Calculations
  const isCritic = profile?.roleName === "Critic" || profile?.roleId === 4;
  const avgRaw = rawReviews.length > 0 ? rawReviews.reduce((acc, r) => acc + r.score, 0) / rawReviews.length : 0;
  const posCount = rawReviews.filter(r => getNormalizedScore(r.score) >= 75).length;
  const mixCount = rawReviews.filter(r => getNormalizedScore(r.score) >= 50 && getNormalizedScore(r.score) < 75).length;
  const negCount = rawReviews.filter(r => getNormalizedScore(r.score) < 50).length;
  
  const highest = rawReviews.length > 0 ? rawReviews.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;
  const lowest = rawReviews.length > 0 ? rawReviews.reduce((prev, current) => (prev.score < current.score) ? prev : current) : null;

  return {
    isCurrentUser: user?.username === targetUsername,
    profile,
    displayReviews,
    isLoading,
    error,
    currentFilter, setCurrentFilter,
    currentSort, setCurrentSort,
    isCritic,
    stats: {
      total: rawReviews.length,
      avgRaw,
      posCount,
      mixCount,
      negCount,
      highest,
      lowest
    }
  };
}