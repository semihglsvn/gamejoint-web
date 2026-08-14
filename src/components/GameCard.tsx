"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Game, formatImageUrl } from "@/lib/api";

function getScoreColor(score: number) {
  if (!score || score === 0) return "bg-joint-gray";
  if (score >= 75) return "bg-joint-green";
  if (score >= 50) return "bg-joint-yellow";
  return "bg-joint-red";
}

export default function GameCard({ game, isCompact = false }: { game: Game; isCompact?: boolean }) {
  const [imgSrc, setImgSrc] = useState(formatImageUrl(game.customBanner || game.coverImage));
  const [imgFailed, setImgFailed] = useState(false);

  const score = game.metascore || 0;
  const scoreText = score === 0 ? "TBD" : score;
  const safeId = game.id || game.gameId;

  return (
    <Link href={`/games/${safeId}`} className="block h-full group w-full">
      <div className="bg-white border border-[#e0e0e0] rounded-[8px] overflow-hidden h-full shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md flex flex-col dark:bg-[#222222] dark:border-[#333]">
        
        {/* Bulletproof Image Container */}
        <div className={`w-full relative bg-[#e0e0e0] dark:bg-[#181818] flex items-center justify-center ${isCompact ? 'h-[100px]' : 'h-[140px]'}`}>
          {!imgFailed ? (
            <Image 
              src={imgSrc} 
              alt={`${game.title} Cover`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              onError={() => {
                // If the remote image 404s, try the placeholder. 
                // If we are ALREADY trying the placeholder, show the CSS fallback.
                if (imgSrc === "/placeholder.png") {
                  setImgFailed(true);
                } else {
                  setImgSrc("/placeholder.png");
                }
              }}
            />
          ) : (
            <span className="text-gray-500 font-bold tracking-wide uppercase text-sm">Empty</span>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className={`m-0 font-bold overflow-hidden text-ellipsis whitespace-nowrap text-gray-900 dark:text-white ${isCompact ? 'mb-2 text-sm' : 'mb-3 text-base'}`}>
            {game.title}
          </h3>

          {!isCompact && (
            <div className="flex gap-2 flex-wrap mb-4">
              {game.genres && game.genres.length > 0 ? (
                game.genres.slice(0, 2).map((genre, idx) => (
                  <span key={idx} className="text-[10px] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-[4px] px-1.5 py-0.5 uppercase font-semibold tracking-wide">
                    {genre}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-[4px] px-1.5 py-0.5 uppercase font-semibold tracking-wide">
                  N/A
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#333] flex justify-between items-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              {isCompact ? 'Score' : 'JointScore'}
            </span>
            <div className={`px-2 py-0.5 text-white font-bold text-sm rounded-[4px] ${getScoreColor(score)}`}>
              {scoreText}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}