"use client";

import { X, Check } from "lucide-react";

export function Comparison() {
  return (
    <section className="py-24 bg-zinc-900/30 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why subscriptions <br />
              <span className="text-red-400">are broken.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Traditional payment rails make micropayments impossible. Credit
              card fees floor transactions at $0.30, forcing creators to bundle
              content into subscriptions that 90% of users reject.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <X size={16} />
                </div>
                <span>Stripe: $0.30 + 2.9% fees</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <X size={16} />
                </div>
                <span>Ethereum: $2.50+ gas fees</span>
              </div>
              <div className="flex items-center gap-4 text-white font-medium">
                <div className="w-8 h-8 rounded-full bg-mint-500/20 flex items-center justify-center text-mint-400">
                  <Check size={16} />
                </div>
                <span>StreamPay: $0.00 fees. Zero Gas.</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-mint-500 to-indigo-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                <div className="p-4">Platform</div>
                <div className="p-4">Gas Cost</div>
                <div className="p-4 text-right">Total ($0.50)</div>
              </div>
              {[
                {
                  name: "Ethereum Direct",
                  gas: "$2.50",
                  total: "$3.00",
                  color: "text-zinc-400",
                },
                {
                  name: "Credit Card",
                  gas: "$0.00",
                  total: "$0.81",
                  color: "text-zinc-400",
                },
                {
                  name: "StreamPay",
                  gas: "$0.00",
                  total: "$0.50",
                  color: "text-mint-400 font-bold",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 items-center p-4 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50 transition-colors ${row.name === "StreamPay" ? "bg-mint-500/5" : ""}`}
                >
                  <div
                    className={`font-medium ${row.color === "text-mint-400 font-bold" ? "text-white" : "text-zinc-300"}`}
                  >
                    {row.name}
                  </div>
                  <div className="text-zinc-500 font-mono text-sm">
                    {row.gas}
                  </div>
                  <div className={`font-mono text-sm text-right ${row.color}`}>
                    {row.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
