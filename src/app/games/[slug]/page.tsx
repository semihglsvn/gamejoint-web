import { getGameDetails, formatImageUrl } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import GameDetailClient from "./GameDetailClient";

// Helper function to create clean, SEO-friendly slugs
function generateSlug(id: number, title: string) {
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/(^-|-$)+/g, "");   // Remove leading or trailing hyphens
  return `${id}-${sanitizedTitle}`;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseInt(slug.split("-")[0], 10);
  
  if (isNaN(id)) return { title: "Game Not Found" };

  const game = await getGameDetails(id);
  if (!game) return { title: "Game Not Found" };

  return {
    title: `${game.title} Reviews & JointScore | GameJoint`,
    description: game.description?.substring(0, 160) || `Check out reviews, scores, and details for ${game.title} on GameJoint.`,
    openGraph: {
      title: `${game.title} | GameJoint`,
      description: game.description?.substring(0, 160),
      images: [formatImageUrl(game.coverImage || game.customBanner)],
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const id = parseInt(slug.split("-")[0], 10);
  
  if (isNaN(id)) return notFound();

  const game = await getGameDetails(id);
  if (!game) return notFound(); 

  const expectedSlug = generateSlug(id, game.title);

  if (slug !== expectedSlug) {
    redirect(`/games/${expectedSlug}`);
  }

  return <GameDetailClient game={game} />;
}