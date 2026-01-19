import Link from "next/link";
import { Lock, Clock, ArrowLeft } from "lucide-react";
import { PREMIUM_ARTICLES } from "@/lib/articles";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              StreamPay
            </span>
          </Link>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint-500/10 border border-mint-500/20 rounded-full mb-6 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-mint-400">
              Live Demo - Pay Per Second
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Premium Content Library
          </h1>
          <p
            className="text-lg text-zinc-400 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Choose an article and experience gasless micropayments in action.
            <br />
            Pay only for what you read. Stop anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {PREMIUM_ARTICLES.map((article, index) => (
            <Link
              key={article.id}
              href={`/demo/${article.id}`}
              className="group"
            >
              <article
                className="h-full  transition-all duration-300 hover:shadow-lg hover:shadow-mint-500/10 hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-5 ">
                  {/*<div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/50 to-transparent" />*/}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1 bg-zinc-950/80 backdrop-blur-sm border border-mint-500/30 rounded-full">
                      <Lock className="w-3 h-3 text-mint-400" />
                      <span className="text-xs font-semibold text-mint-400">
                        Premium
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-mint-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {article.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-inter">
                      {article.authorAddress.slice(0, 6)}...
                      {article.authorAddress.slice(-4)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min</span>
                      </div>
                      <div className=" text-mint-400 font-semibold">
                        <span>${article.ratePerMinute}/min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Est. cost</div>
                      <div className="text-sm font-bold text-white">
                        ~${article.estimatedCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full px-4 py-2 bg-mint-500/10 border border-mint-500/20 rounded-lg text-center text-sm font-semibold text-mint-400 group-hover:bg-mint-500 group-hover:text-zinc-950 transition-all duration-200">
                      Read Article →
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
