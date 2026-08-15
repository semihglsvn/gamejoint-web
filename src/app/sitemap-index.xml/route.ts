import { API_BASE_URL } from '@/lib/config';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://game-joint.net';
const CHUNK_SIZE = 50000;

export async function GET() {
  // Fetch the exact same count we used to generate the chunks
  const res = await fetch(`${API_BASE_URL}/games/count`, { next: { revalidate: 3600 } });
  const totalGames = await res.json();
  const totalSitemaps = Math.ceil(totalGames / CHUNK_SIZE);

  // Build the standard XML Sitemap Index header
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Dynamically generate a <sitemap> block for every chunk Next.js created
  for (let i = 0; i < totalSitemaps; i++) {
    xml += `
  <sitemap>
    <loc>${SITE_URL}/sitemap/${i}.xml</loc>
  </sitemap>`;
  }

  // Close the XML tag
  xml += `\n</sitemapindex>`;

  // Return as a raw XML file
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}