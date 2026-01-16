"use client";

export function Stats() {
  return (
    <section className="py-16 bg-zinc-900/30 border-y border-zinc-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-mint-400 mb-2">
              $0.00
            </div>
            <div className="text-sm text-zinc-400">Average gas cost</div>
            <div className="text-xs text-zinc-600 mt-1">Truly gasless</div>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-mint-400 mb-2">
              40%
            </div>
            <div className="text-sm text-zinc-400">Higher conversion</div>
            <div className="text-xs text-zinc-600 mt-1">vs subscriptions</div>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-mint-400 mb-2">
              99.9%
            </div>
            <div className="text-sm text-zinc-400">Cheaper fees</div>
            <div className="text-xs text-zinc-600 mt-1">than alternatives</div>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-mint-400 mb-2">
              0.1%
            </div>
            <div className="text-sm text-zinc-400">Platform fee</div>
            <div className="text-xs text-zinc-600 mt-1">That&apos;s it.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
