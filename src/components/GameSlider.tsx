"use client";
import { useRef } from "react";
import GameCard from "./GameCard";
import { Game } from "@/lib/api";

export default function GameSlider({ title, games }: { title: string; games: Game[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      // Scroll by roughly the width of 3 cards
      const scrollAmount = direction === "left" ? -800 : 800; 
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!games || !Array.isArray(games) || games.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header & Arrows */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-800 dark:border-[#555] pb-2">
        <h2 className="m-0 text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
          {title}
        </h2>
        
        {/* Navigation Arrows (Hidden on Mobile) */}
        <div className="hidden md:flex gap-1">
          <button 
            onClick={() => scroll("left")}
            className="w-[30px] h-[30px] bg-black/60 hover:bg-black/90 text-white rounded flex items-center justify-center transition-colors"
            aria-label="Scroll Left"
          >
            &#10094;
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-[30px] h-[30px] bg-black/60 hover:bg-black/90 text-white rounded flex items-center justify-center transition-colors"
            aria-label="Scroll Right"
          >
            &#10095;
          </button>
        </div>
      </div>

      {/* The Scrollable Track */}
      <div 
        ref={sliderRef}
        className="flex gap-[15px] lg:gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 md:pb-2"
      >
        {games.map((game) => {
          const uniqueKey = game.id || game.gameId || Math.random(); 
          return (
            <div 
              key={uniqueKey} 
              // Mobile: 85% width | Tablet: 45% width | Desktop: Exactly 1/4th of the container minus the gap
              className="snap-start shrink-0 w-[85%] sm:w-[45%] md:w-[calc(25%-15px)] lg:w-[calc(25%-15px)]"
            >
              <GameCard game={game} />
            </div>
          );
        })}
      </div>
    </div>
  );
}