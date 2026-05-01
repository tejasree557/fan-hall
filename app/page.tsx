import { HeroSection } from "@/components/hero-section";
import { StoriesSection } from "@/components/stories-section";
import { PlayersSection } from "@/components/players-section";
import { FanBattleSection } from "@/components/fan-battle-section";
import { FanFavoritesSection } from "@/components/fan-favorites-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StoriesSection />
      <PlayersSection />
      <FanBattleSection />
      <FanFavoritesSection />
    </main>
  );
}
