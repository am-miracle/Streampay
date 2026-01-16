import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Stats } from "@/components/stats";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Comparison } from "@/components/comparison";
import { UseCases } from "@/components/use-cases";
import { ForCreators } from "@/components/for-creators";
import { Architecture } from "@/components/architecture";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <div id="features">
          <Features />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <Comparison />
        <div id="use-cases">
          <UseCases />
        </div>
        <div id="creators">
          <ForCreators />
        </div>
        <Architecture />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
