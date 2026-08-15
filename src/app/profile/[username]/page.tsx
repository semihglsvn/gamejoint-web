import { Metadata } from "next";
import ProfileClient from "./ProfileClient";
import { constructMetadata } from "@/lib/seo"; // Import the utility

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  
  // Return the globally structured metadata
  return constructMetadata({
    title: `${username}'s Profile | GameJoint`,
    description: `View ${username}'s video game reviews, ratings, and distribution stats on GameJoint.`,
    url: `/profile/${username}`,
    // We intentionally leave 'image' undefined so it falls back to the default GameJoint logo!
  });
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  
  return <ProfileClient targetUsername={username} />;
}