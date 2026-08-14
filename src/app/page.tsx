import { getGames } from "@/lib/api";
import GameSlider from "@/components/GameSlider";

export default async function Home() {
  const [featured, trending, newReleases, topRated] = await Promise.all([
    getGames("featured"),
    getGames("trending"),
    getGames("new-releases"),
    getGames("top-rated"),
  ]);

  const sections = [
    { title: "Featured Games", data: featured },
    { title: "Trending", data: trending },
    { title: "New Releases", data: newReleases },
    { title: "Top Rated", data: topRated },
  ];

  return (
    <div className="w-full">
      
      {/* --- SEO HERO SECTION --- */}
      <section className="mb-12 mt-4 flex flex-col items-center justify-center text-center bg-gray-100 dark:bg-[#1E1E1E] border border-gray-300 dark:border-[#333] rounded-[8px] p-10 shadow-sm transition-colors">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            The Ultimate Video Game Database and Review Community.
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            GameJoint is your ultimate database for tracking new releases, exploring critical reception via the JointScore, and sharing your own video game reviews with the community.
          </p>
        </div>
      </section>
      {/* ------------------------ */}

      {sections.map((section, index) => {
        if (!section.data || !Array.isArray(section.data) || section.data.length === 0) return null;

        return (
          <div key={index} className="mb-2">
            <GameSlider title={section.title} games={section.data} />
            
            {/* Divider */}
            {index < sections.length - 1 && (
              <hr className="mb-[30px] mt-[10px] border-0 border-t border-[#ddd] dark:border-[#333]" />
            )}
          </div>
        );
      })}
    </div>
  );
}