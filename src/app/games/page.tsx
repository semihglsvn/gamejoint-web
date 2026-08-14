import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Explore Games | GameJoint",
  description: "Search and filter through the entire GameJoint database.",
};

export default function GamesSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center mt-20">
        <Loader2 className="animate-spin text-joint-green" size={32} />
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}