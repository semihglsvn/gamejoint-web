import { API_BASE_URL } from "./config";

export interface Game {
  id?: number;
  gameId?: number; // Featured games use this
  title: string;
  coverImage: string;
  customBanner?: string;
  genres?: string[]; 
  metascore: number;
}

export interface GameDetail extends Game {
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  platforms?: string[];
  platformNames?: string[];
  genreNames?: string[];
}

export interface ReviewResponse {
  id: number;
  gameId: number;
  authorId: number;
  authorUsername: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export async function getGames(endpoint: string): Promise<Game[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${endpoint}`, {
      next: { revalidate: 1800 }, // Stale-While-Revalidate caching
    });
    
    if (!res.ok) return [];
    
    const json = await res.json();

    if (json && Array.isArray(json.content)) {
      return json.content;
    }

    if (Array.isArray(json)) {
      return json;
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
}

export async function getGameDetails(id: string | number): Promise<GameDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${id}`, {
      next: { revalidate: 3600 }, // Cache game details for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch game details for ${id}:`, error);
    return null;
  }
}

export async function getGameReviews(gameId: string | number, roleId: number, size: number = 50): Promise<ReviewResponse[]> {
  try {
    // Note: Adjust this endpoint path to match your exact Spring Boot ReviewController mapping
    const res = await fetch(`${API_BASE_URL}/reviews/game/${gameId}?roleId=${roleId}&size=${size}`, {
      next: { revalidate: 60 }, // Cache reviews for 60 seconds
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.content || json || [];
  } catch (error) {
    console.error(`Failed to fetch reviews for game ${gameId}:`, error);
    return [];
  }
}

export async function submitReview(gameId: number, score: number, comment: string) {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ gameId, score, comment }),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

export async function updateReview(reviewId: number, score: number, comment: string) {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ score, comment }),
  });
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
}

export async function deleteReview(reviewId: number) {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete review");
  return res.text();
}

export async function submitReport(reviewId: number, reasons: string[]) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reviewId, reasons }),
  });
  if (!res.ok) throw new Error("Failed to submit report");
  return res.json();
}

export async function banUser(targetUserId: number, durationDays: number | null, reason: string) {
  const res = await fetch(`${API_BASE_URL}/moderation/users/${targetUserId}/ban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ durationDays, reason }),
  });
  if (!res.ok) throw new Error("Failed to ban user");
  return res.json();
}

export function formatImageUrl(url?: string): string {
  if (!url) return "/placeholder.png";
  
  if (url.includes("assets/images/placeholder.png")) return "/placeholder.png";
  
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export interface SearchParams {
  q?: string;
  hideTbd?: boolean;
  genres?: string[];
  platforms?: string[];
  isMatchAll?: boolean;
  sortBy?: string;
  page?: number;
  size?: number;
}

export async function searchGames(params: SearchParams) {
  const query = new URLSearchParams();

  if (params.q) query.append("q", params.q);
  if (params.hideTbd) query.append("hideTbd", "true");
  if (params.isMatchAll) query.append("isMatchAll", "true");
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());
  
  if (params.genres && params.genres.length > 0) {
    query.append("genres", params.genres.join(","));
  }
  if (params.platforms && params.platforms.length > 0) {
    query.append("platforms", params.platforms.join(","));
  }

  const res = await fetch(`${API_BASE_URL}/games/search?${query.toString()}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

// Add to src/lib/api.ts

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  deletionDate?: string | null;
}

export async function getProfile(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function requestSettingsOtp() {
  const res = await fetch(`${API_BASE_URL}/users/settings/otp`, {
    method: "POST",
    credentials: "include"
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to send code");
  }
  return res.json();
}

export async function changeEmail(otpCode: string, newEmail: string) {
  const res = await fetch(`${API_BASE_URL}/users/email`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ otpCode, newEmail })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to change email");
  }
  return res.json();
}

export async function changePassword(otpCode: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/users/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ otpCode, newPassword })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to change password");
  }
  return res.json();
}

export async function deleteAccount(otpCode: string) {
  const res = await fetch(`${API_BASE_URL}/users/account`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ otpCode })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to schedule deletion");
  }
  return res.json();
}

export async function cancelDeletion() {
  const res = await fetch(`${API_BASE_URL}/users/cancel-deletion`, {
    method: "POST",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to cancel deletion");
  return res.json();
}