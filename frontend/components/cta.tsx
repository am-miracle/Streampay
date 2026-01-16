"use client";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-mint-500/5"></div>
      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
          Ready to monetize <br />
          <span className="italic text-zinc-500">by the second?</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" className="h-14 px-10 text-lg">
            Try Live Demo
          </Button>
          <Button variant="secondary" className="h-14 px-10 text-lg">
            Start Building
          </Button>
        </div>
      </div>
    </section>
  );
}
