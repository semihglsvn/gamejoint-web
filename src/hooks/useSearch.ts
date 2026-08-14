import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { searchGames, Game } from "@/lib/api";

export const SORT_OPTIONS = ["Highest Rated", "Lowest Rated", "Newest First", "Oldest First"];
export const AVAILABLE_GENRES = ["Action", "Adventure", "Arcade", "Board Games", "Card", "Casual", "Educational", "Family", "Fighting", "Indie", "Massively Multiplayer", "Platformer", "Puzzle", "Racing", "RPG", "Shooter", "Simulation", "Sports", "Strategy"];
export const AVAILABLE_PLATFORMS = ["3DO", "Android", "Apple II", "Atari 2600", "Atari 5200", "Atari 7800", "Atari 8-bit", "Atari Flashback", "Atari Lynx", "Atari ST", "Classic Macintosh", "Commodore / Amiga", "Dreamcast", "Game Boy", "Game Boy Advance", "Game Boy Color", "Game Gear", "GameCube", "Genesis", "iOS", "Jaguar", "Linux", "macOS", "Neo Geo", "NES", "PC", "PlayStation 5", "PlayStation 4", "PlayStation 3", "PlayStation 2", "Xbox Series S/X", "Xbox One", "Xbox 360", "Nintendo Switch", "Web"];

export function useSearch() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(initialQuery);
  const [hideTbd, setHideTbd] = useState(false);
  const [isMatchAll, setIsMatchAll] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());

  const [games, setGames] = useState<Game[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (page: number, isRefreshing: boolean) => {
    try {
      if (isRefreshing) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const data = await searchGames({
        q: query,
        hideTbd,
        isMatchAll,
        sortBy,
        genres: Array.from(selectedGenres),
        platforms: Array.from(selectedPlatforms),
        page,
        size: 24
      });

      const newGames = data?.content || [];
      
      setTotalResults(data?.totalElements || 0);
      setIsLastPage(newGames.length < 24);

      if (isRefreshing) {
        setGames(newGames);
      } else {
        setGames(prev => [...prev, ...newGames]);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [query, hideTbd, isMatchAll, sortBy, selectedGenres, selectedPlatforms]);

  // Initial load or explicit search
  const performSearch = () => {
    setCurrentPage(0);
    setIsLastPage(false);
    fetchResults(0, true);
  };

  // Pagination trigger
  const loadNextPage = () => {
    if (isLastPage || isLoadingMore || isLoading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchResults(nextPage, false);
  };

  // Auto-trigger search if an initial query is passed via URL
  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGenre = (genre: string) => {
    const newSet = new Set(selectedGenres);
    if (newSet.has(genre)) newSet.delete(genre);
    else newSet.add(genre);
    setSelectedGenres(newSet);
  };

  const togglePlatform = (platform: string) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) newSet.delete(platform);
    else newSet.add(platform);
    setSelectedPlatforms(newSet);
  };

  return {
    query, setQuery,
    hideTbd, setHideTbd,
    isMatchAll, setIsMatchAll,
    sortBy, setSortBy,
    selectedGenres, toggleGenre,
    selectedPlatforms, togglePlatform,
    games, totalResults,
    isLoading, isLoadingMore, isLastPage, error,
    performSearch, loadNextPage
  };
}