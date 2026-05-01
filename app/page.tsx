import { HeroSection } from "@/components/hero-section";
import { FanLetterSection } from "@/components/fan-letter-section";
import { TeamIndiaCard } from "@/components/team-india-card";
import { FanFavoritesSection } from "@/components/fan-favorites-section";
import { TrendingStoriesSection } from "@/components/trending-stories-section";
import { FanBattleSection } from "@/components/fan-battle-section";
import { PlayersSection } from "@/components/players-section";
import { StoriesSection } from "@/components/stories-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 1. Homepage / Hero */}
      <HeroSection />
      
      {/* 2. Fan Letter */}
      <FanLetterSection />
      
      {/* 3. Team India Card */}
      <TeamIndiaCard />
      
{/* 4. Fan Favorites */}
      <FanFavoritesSection />

      {/* 5. Fan Battle Section */}
      <FanBattleSection />

      {/* 6. Trending Stories (just above Players) */}
      <TrendingStoriesSection />

      {/* 7. Player Section */}
      <PlayersSection />

      {/* 8. Stories Section (Last) */}
      <StoriesSection />
    </main>
  );
}
