import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://game-joint.net";
const DEFAULT_IMAGE = `${SITE_URL}/opengraph-image.png`; 

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  url?: string;
};

export function constructMetadata({
  title,
  description,
  image,
  url,
}: SeoProps): Metadata {
  
  // Calculate the full URL once
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return {
    title,
    description,
    // NEW: Explicitly tells Google the master URL for this specific page
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "GameJoint",
      images: [
        {
          url: image || DEFAULT_IMAGE,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || DEFAULT_IMAGE],
    },
  };
}