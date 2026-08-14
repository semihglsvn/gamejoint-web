"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Settings, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatImageUrl, Game } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config"; // NEW: Import your dynamic URL

export default function Navbar() {
  // NEW: Destructure isLoading to prevent UI flashing
  const { isAuthenticated, user, logout, isLoading: isAuthLoading } = useAuth();
  
  // Async Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [asyncResults, setAsyncResults] = useState<Game[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Call with Race Condition Prevention
  useEffect(() => {
    if (searchQuery.length < 3) {
      setAsyncResults([]);
      setIsSearchExpanded(false);
      return;
    }

    let isActive = true; // NEW: Prevents older requests from overwriting newer ones

    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        // NEW: Use dynamic base URL
        const res = await fetch(`${API_BASE_URL}/games/search?q=${searchQuery}&page=0&size=4`);
        if (res.ok && isActive) {
          const data = await res.json();
          if (data && Array.isArray(data.content)) {
            setAsyncResults(data.content);
            setIsSearchExpanded(true);
          }
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        if (isActive) setIsSearchLoading(false);
      }
    }, 500);

    return () => {
      isActive = false; // Cleanup if the user types again before the fetch finishes
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <header className="w-full bg-[#1E1E1E] text-white shadow-md z-50 relative">
      <div className="max-w-[1100px] mx-auto px-[15px] py-3 flex items-center justify-between gap-3 md:gap-6">
        
        {/* 1. THE LOGO */}
        <Link href="/" className="shrink-0">
          <Image 
            src="/logo.svg" 
            alt="GameJoint" 
            width={140} 
            height={40} 
            className="h-[26px] md:h-[35px] w-auto object-contain" 
            priority 
          />
        </Link>
        <nav className="hidden md:flex gap-4 text-[14px] font-bold tracking-wide uppercase">
            <Link href="/games" className="hover:text-joint-green px-2 py-1 rounded transition-colors">Games</Link>
        </nav>

        {/* 2. THE SEARCH BAR */}
        <div className="flex-1 max-w-[400px] relative" ref={searchRef}>
          <form action="/games" method="GET" className="relative flex items-center w-full">
            <input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (asyncResults.length > 0) setIsSearchExpanded(true) }}
              placeholder="Search..."
              autoComplete="off"
              className="w-full px-4 py-2 pr-10 text-[14px] rounded-full bg-[#333333] text-white border-none focus:outline-none focus:ring-2 focus:ring-joint-green transition-shadow"
            />
            <button
              type="submit"
              className="absolute right-3 top-0 bottom-0 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              {isSearchLoading ? <Loader2 size={18} className="animate-spin text-joint-green" /> : <Search size={18} />}
            </button>
          </form>

          {/* Search Dropdown */}
          {isSearchExpanded && asyncResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#333333] border border-[#444] rounded-[8px] shadow-xl overflow-hidden z-[99999]">
              {asyncResults.map((game) => (
                <Link 
                  key={game.id} 
                  href={`/games/${game.id}`} // The Canonical Redirect in page.tsx will auto-fix this URL!
                  onClick={() => setIsSearchExpanded(false)}
                  className="flex items-center gap-3 p-3 hover:bg-[#444] transition-colors border-b border-[#444] last:border-0"
                >
                  <div className="w-[40px] h-[40px] relative shrink-0 bg-[#222] rounded-[4px] overflow-hidden">
                    <Image 
                      src={formatImageUrl(game.coverImage)} 
                      alt="" 
                      fill 
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold text-white truncate">
                    {game.title}
                  </span>
                </Link>
              ))}
              <Link 
                href={`/games?search=${searchQuery}`}
                onClick={() => setIsSearchExpanded(false)}
                className="block w-full text-center p-2 text-xs font-bold text-gray-400 hover:text-white bg-[#2a2a2a] transition-colors uppercase tracking-wider"
              >
                View All Results
              </Link>
            </div>
          )}
        </div>

        {/* 3. AUTH & MENU */}
        {/* NEW: Use min-width to prevent layout shifting while checking auth state */}
        <nav className="flex items-center shrink-0 min-w-[140px] justify-end">
          {isAuthLoading ? (
            <Loader2 size={20} className="animate-spin text-joint-green" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-1 md:gap-2">
              <Link href={`/profile/${user?.username}`} className="hidden md:block font-bold hover:bg-[#333] px-3 py-1.5 rounded transition-colors truncate max-w-[120px]">
                {user?.username}
              </Link>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-full transition-colors" aria-label="Settings">
                <Settings size={20} />
              </Link>
              <button onClick={logout} className="p-2 text-joint-red hover:text-white hover:bg-joint-red rounded-full transition-colors" aria-label="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-[13px] md:text-[14px]">
              <Link href="/login" className="px-3 py-1.5 bg-[#444] text-white rounded-[6px] hover:bg-[#555] transition-colors hidden sm:block">
                Login
              </Link>
              <Link href="/register" className="px-3 py-1.5 bg-joint-green text-white rounded-[6px] hover:bg-opacity-80 transition-colors">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}