import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  
  return {
    title: `${username}'s Profile | GameJoint`,
    description: `View ${username}'s video game reviews, ratings, and distribution stats on GameJoint.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  
  return <ProfileClient targetUsername={username} />;
}