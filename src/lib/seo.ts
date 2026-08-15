import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://game-joint.net";
// Use your standard logo or the opengraph-image.png we made earlier as a fallback
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
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: url ? `${SITE_URL}${url}` : SITE_URL,
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