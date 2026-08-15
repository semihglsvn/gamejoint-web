import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/config';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://game-joint.net';
const CHUNK_SIZE = 50000;

// Helper function to format the title into a URL-safe slug
function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// NEW: Bulletproof date parser to catch bad database strings
function safeDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date(); 
  
  const parsed = new Date(dateString);
  // If JS fails to parse the string, getTime() returns NaN
  if (isNaN(parsed.getTime())) return new Date(); 
  
  return parsed;
}

export async function generateSitemaps() {
  const res = await fetch(`${API_BASE_URL}/games/count`, { next: { revalidate: 3600 } });
  const totalGames = await res.json();
  const totalSitemaps = Math.ceil(totalGames / CHUNK_SIZE);
  return Array.from({ length: totalSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: Promise<number> | number }): Promise<MetadataRoute.Sitemap> {
  const page = await id;
  
  const res = await fetch(`${API_BASE_URL}/games/sitemap?page=${page}&size=${CHUNK_SIZE}`, {
    next: { revalidate: 86400 } 
  });

  if (!res.ok) {
    console.error(`Sitemap failed to fetch chunk ${page}. Status: ${res.status}`);
    return [];
  }

  const games: { id: number; updatedAt: string; title: string }[] = await res.json();

  const gameRoutes = games.map((game) => ({
    url: `${SITE_URL}/games/${game.id}-${slugify(game.title)}`,
    lastModified: safeDate(game.updatedAt), // FIXED: Wrapping the date in the safety checker
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  if (page === 0) {
    const staticRoutes = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/games`,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }
    ];
    return [...staticRoutes, ...gameRoutes];
  }

  return gameRoutes;
}