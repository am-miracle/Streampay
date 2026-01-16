"use client";

import { Card } from "@/components/ui/card";

export function UseCases() {
  const cases = [
    {
      category: "Content Creators",
      problem: "Tired of losing readers to paywalls?",
      examples: [
        {
          before: "$5/month Medium subscription",
          after: "$0.05 to read one article",
          savings: "100x more accessible",
        },
        {
          before: "$30 online course",
          after: "$0.20 for a 10-min tutorial",
          savings: "Pay only for what you watch",
        },
        {
          before: "$40 research paper",
          after: "$0.50 to read once",
          savings: "No commitment needed",
        },
      ],
    },
    {
      category: "SaaS Products",
      problem: "Users won't commit to monthly plans?",
      examples: [
        {
          before: "$49/month API tier",
          after: "$0.001 per API call",
          savings: "Perfect for side projects",
        },
        {
          before: "$15/month design tool",
          after: "$0.05 per minute used",
          savings: "Occasional users actually pay",
        },
        {
          before: "$29/month AI credits",
          after: "Pay per generation",
          savings: "No unused credits wasted",
        },
      ],
    },
    {
      category: "Entertainment",
      problem: "People don't want another subscription.",
      examples: [
        {
          before: "$10/month for 20 songs",
          after: "$0.001 per song played",
          savings: "Support artists directly",
        },
        {
          before: "Buy full audiobook at $25",
          after: "$0.15 per chapter",
          savings: "Stop when you want",
        },
        {
          before: "$15/month podcast app",
          after: "Pay creators per episode",
          savings: "True creator economy",
        },
      ],
    },
    {
      category: "Gaming & Services",
      problem: "Upfront costs kill conversions?",
      examples: [
        {
          before: "$60 upfront game purchase",
          after: "$0.10 per hour played",
          savings: "Try before you commit",
        },
        {
          before: "$50/hour coaching",
          after: "$0.83 per minute",
          savings: "Get help when stuck",
        },
        {
          before: "$5 tournament entry",
          after: "$0.25 micro-stakes",
          savings: "Lower barrier to entry",
        },
      ],
    },
  ];

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            This changes everything.
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Subscriptions work for Netflix. They don&apos;t work for everything
            else. Here&apos;s what pay-per-second unlocks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {cases.map((useCase, i) => (
            <Card
              key={i}
              className="p-8 hover:border-mint-500/30 transition-colors"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {useCase.category}
                </h3>
                <p className="text-zinc-400 text-sm">{useCase.problem}</p>
              </div>

              <div className="space-y-4">
                {useCase.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-zinc-800 pl-4 py-2 hover:border-mint-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex-1">
                        <div className="text-sm text-zinc-500 line-through mb-1">
                          {example.before}
                        </div>
                        <div className="text-mint-400 font-medium">
                          {example.after}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">
                      {example.savings}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-500 max-w-3xl mx-auto">
            The{" "}
            <span className="text-white font-medium">
              $1.5 trillion creator economy
            </span>{" "}
            is locked behind paywalls that 90% of people bounce from. We&apos;re
            fixing that.
          </p>
        </div>
      </div>
    </section>
  );
}
