"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { useSearch, SORT_OPTIONS, AVAILABLE_GENRES, AVAILABLE_PLATFORMS } from "@/hooks/useSearch";
import GameCard from "@/components/GameCard"; // BRING IN YOUR REUSABLE COMPONENT

export default function SearchClient() {
  const {
    query, setQuery,
    hideTbd, setHideTbd,
    isMatchAll, setIsMatchAll,
    sortBy, setSortBy,
    selectedGenres, toggleGenre,
    selectedPlatforms, togglePlatform,
    games, totalResults,
    isLoading, isLoadingMore, isLastPage, error,
    performSearch, loadNextPage
  } = useSearch();

  const [showFilters, setShowFilters] = useState(query === "");

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Explore</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] text-gray-900 dark:text-white rounded-lg transition-colors font-bold text-sm"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm flex flex-col gap-5">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { performSearch(); } }}
              placeholder="Type a game name..."
              className="w-full bg-gray-50 dark:bg-[#333] border-none text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-joint-green"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Sort By</label>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#333] text-gray-900 dark:text-white py-3 px-4 appearance-none rounded-lg focus:outline-none focus:ring-2 focus:ring-joint-green font-semibold cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hideTbd} onChange={(e) => setHideTbd(e.target.checked)} className="w-5 h-5 accent-joint-green cursor-pointer" />
                <span className="font-semibold text-gray-900 dark:text-white">Hide TBD Scores</span>
              </label>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-bold">Logic:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!isMatchAll} onChange={() => setIsMatchAll(false)} className="w-4 h-4 accent-[#2D9CDB]" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">OR</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={isMatchAll} onChange={() => setIsMatchAll(true)} className="w-4 h-4 accent-[#2D9CDB]" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">AND</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Genres</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedGenres.has(genre) ? 'bg-[#2D9CDB] text-white border-[#2D9CDB]' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333]'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white mb-2 block">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PLATFORMS.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedPlatforms.has(platform) ? 'bg-joint-green text-white border-joint-green' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#333]'}`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { performSearch(); }}
            className="w-full py-3 bg-joint-green hover:bg-opacity-90 text-white font-bold rounded-lg transition-colors mt-2"
          >
            APPLY FILTERS
          </button>
        </div>
      )}

      {/* RESULTS */}
      <div className="flex flex-col gap-4 mt-2">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-joint-green" size={40} /></div>
        ) : error ? (
          <div className="py-20 text-center font-bold text-joint-red">{error}</div>
        ) : games.length === 0 ? (
          <div className="py-20 text-center font-semibold text-gray-500">
            {query === "" && !showFilters ? "Use the filters to find games." : "No games found matching your criteria."}
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-gray-500 px-2">Found {totalResults} games</p>
            
            {/* CLEAN REUSABLE GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {games.map(game => (
                <div key={game.id} className="h-full">
                  <GameCard game={game} />
                </div>
              ))}
            </div>

            {/* Load More Trigger */}
            {!isLastPage && (
              <button 
                onClick={loadNextPage} 
                disabled={isLoadingMore}
                className="w-full py-4 mt-4 font-bold text-joint-green bg-joint-green/10 hover:bg-joint-green/20 rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                {isLoadingMore ? <><Loader2 className="animate-spin" size={18} /> Loading...</> : "Load More"}
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}