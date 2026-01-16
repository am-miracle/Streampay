"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ForCreators() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built for creators who are tired of losing 90% of their audience
                to paywalls.
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                You know your content is worth it. But asking someone to commit
                to $10/month before they&apos;ve even read one article? That's
                why they bounce.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-white font-medium mb-1">
                      Instant settlement
                    </div>
                    <div className="text-sm text-zinc-500">
                      No 30-day holds. No minimum payouts. Withdraw anytime.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-white font-medium mb-1">
                      5 lines of code
                    </div>
                    <div className="text-sm text-zinc-500">
                      Add our widget. Set your rate. Done in under 2 minutes.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-white font-medium mb-1">
                      You own the relationship
                    </div>
                    <div className="text-sm text-zinc-500">
                      No platform lock-in. Export your data. Leave whenever you
                      want.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-white font-medium mb-1">
                      You set the price
                    </div>
                    <div className="text-sm text-zinc-500">
                      $0.01/minute? $0.10? You decide what your time is worth.
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="group">
                Start Earning{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div>
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                  <div>
                    <div className="text-xs text-zinc-500 font-mono mb-1">
                      Integration
                    </div>
                    <div className="text-sm font-medium text-white">
                      Seriously, it&apos;s this simple:
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
                  <div className="text-zinc-600">
                    {"<!-- Add to your page -->"}
                  </div>
                  <div className="text-purple-400 mt-2">
                    {"<script"} <span className="text-zinc-400">src=</span>
                    <span className="text-green-400">
                      &quot;https://cdn.streampay.io/widget.js&quot;
                    </span>
                    {"></script>"}
                  </div>

                  <div className="text-zinc-600 mt-4">
                    {"<!-- Initialize -->"}
                  </div>
                  <div className="text-purple-400 mt-2">{"<script>"}</div>
                  <div className="ml-4 text-blue-400">
                    StreamPay<span className="text-white">.</span>
                    <span className="text-yellow-400">init</span>
                    <span className="text-white">{"({"}</span>
                  </div>
                  <div className="ml-8 text-zinc-400">
                    contentSelector<span className="text-white">:</span>{" "}
                    <span className="text-green-400">&apos;#article&apos;</span>
                    <span className="text-white">,</span>
                  </div>
                  <div className="ml-8 text-zinc-400">
                    creatorAddress<span className="text-white">:</span>{" "}
                    <span className="text-green-400">&apos;0x...&apos;</span>
                    <span className="text-white">,</span>
                  </div>
                  <div className="ml-8 text-zinc-400">
                    rate<span className="text-white">:</span>{" "}
                    <span className="text-orange-400">0.02</span>{" "}
                    <span className="text-zinc-600">// $0.02/min</span>
                  </div>
                  <div className="ml-4 text-white">{"});"}</div>
                  <div className="text-purple-400">{"</script>"}</div>
                </div>

                <div className="mt-4 text-xs text-zinc-600">
                  That&apos;s it. We handle wallets, gas fees, settlement. You
                  focus on creating.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
