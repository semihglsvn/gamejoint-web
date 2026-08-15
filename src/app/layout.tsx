import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers"; 
import { constructMetadata } from "@/lib/seo"; // Import the utility

const inter = Inter({ subsets: ["latin"] });

// Wrap your default site info in the utility to generate all OG/Twitter tags automatically
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  ...constructMetadata({
    title: "GameJoint",
    description: "A community for gamers and critics.",
    // We omit the image here so it defaults to your opengraph-image.png!
  }),
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50 dark:bg-[#121212]`}>
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-[1100px] mx-auto px-[15px] pt-[20px] pb-[40px]">
            {children}
          </main>
          <footer className="w-full bg-[#000000] text-white py-5 text-center mt-auto border-t border-[#333]">
            <div className="max-w-[1100px] mx-auto px-[15px]">
              <p className="font-bold text-sm mb-2">&copy; {new Date().getFullYear()} GameJoint. All rights reserved.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}