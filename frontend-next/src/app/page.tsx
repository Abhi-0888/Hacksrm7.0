import { Hero } from "@/components/sections/Hero";
import { StatBar } from "@/components/sections/StatBar";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LiveFeed } from "@/components/sections/LiveFeed";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatBar />
      <HowItWorks />
      <LiveFeed />
      <Footer />
    </div>
  );
}
