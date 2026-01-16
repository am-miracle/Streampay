"use client";

import { CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect your wallet",
      description:
        "One click. We create a smart account for you. Takes 2 seconds.",
      note: "MetaMask, Coinbase Wallet, or any EVM wallet works",
    },
    {
      number: "02",
      title: "Approve USDC once",
      description:
        "Give permission to spend from your wallet. You only do this one time, for any amount you choose.",
      note: "You stay in full control of your funds",
    },
    {
      number: "03",
      title: "Start consuming content",
      description:
        "Click play, read the article, use the tool. The counter updates every 100ms showing exactly what you're spending.",
      note: "Zero gas fees. Seriously.",
    },
    {
      number: "04",
      title: "Stop whenever you want",
      description:
        "Close the tab, hit pause, walk away. Payment stops instantly. You're only charged for what you actually used.",
      note: "No cancellation fees, no hoops to jump through",
    },
  ];

  return (
    <section className="py-24 bg-zinc-900/30 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How does this actually work?
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Four steps. No complicated setup. No learning curve.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-20 bottom-0 w-px bg-zinc-800" />
              )}

              <div className="flex gap-6 relative">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-zinc-95 border-2 border-mint-500/50 flex items-center justify-center text-mint-400 font-bold relative z-10 bg-zinc-950">
                    {step.number}
                  </div>
                </div>

                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 mb-3 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="flex items-start gap-2 text-sm text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-mint-500/50 shrink-0 mt-0.5" />
                    <span>{step.note}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h4 className="text-lg font-bold text-white mb-4">Real example:</h4>
            <div className="space-y-2 text-sm text-zinc-400 leading-relaxed">
              <p>Sarah wants to read a premium article about Web3 payments.</p>
              <p className="text-white">
                Instead of:{" "}
                <span className="text-red-400">$5/month subscription</span>{" "}
                (which she&apos;ll forget to cancel)
              </p>
              <p className="text-white">
                She pays: <span className="text-mint-400">$0.06</span> for 3
                minutes of reading
              </p>
              <p className="text-zinc-600">
                The writer gets paid instantly. Sarah moves on with her day. No
                subscription guilt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
