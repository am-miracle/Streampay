"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ArrowRight, Wallet } from "lucide-react";

export function Hero() {
  const [streamActive, setStreamActive] = useState(false);
  const [balance, setBalance] = useState(0.0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startStream = () => {
    setStreamActive(true);
    intervalRef.current = setInterval(() => {
      setBalance((prev) => prev + 0.0004);
    }, 50);
  };

  const stopStream = () => {
    setStreamActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-mint-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-200 h-150 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/*<div
            className="mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Badge variant="outline">
              <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
              Live on Base Testnet
            </Badge>
          </div>*/}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 animate-fade-in-up leading-[1.1]">
            Micropayments. <br />
            <span className="text-zinc-600 bg-clip-text bg-linear-to-r from-mint-300 to-mint-500">
              Zero Gas. Real Time.
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Connect once, pay by the second, stop anytime. No subscriptions. No
            minimums. No gas fees. Just pay for exactly what you use.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <a href="/demo" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full group">
                Try Live Demo{" "}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/demo" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                View Demo
              </Button>
            </a>
          </div>
          <div
            className="w-full max-w-md animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-1 shadow-2xl overflow-hidden">
              <div
                className={`absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 transition-transform duration-1000 ${
                  streamActive ? "translate-x-full" : "-translate-x-full"
                }`}
              ></div>

              <div className="bg-zinc-950 rounded-xl p-6 flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Wallet className="text-zinc-400 w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-zinc-500 font-mono">
                        Status
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          streamActive ? "text-mint-400" : "text-zinc-300"
                        }`}
                      >
                        {streamActive ? "Streaming USDC..." : "Idle"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 font-mono">Cost</div>
                    <div className="text-2xl font-mono font-bold text-white tracking-wider">
                      ${balance.toFixed(4)}
                    </div>
                  </div>
                </div>

                <button
                  onMouseDown={startStream}
                  onMouseUp={stopStream}
                  onMouseLeave={stopStream}
                  onTouchStart={startStream}
                  onTouchEnd={stopStream}
                  className={`w-full py-4 rounded-lg font-medium transition-all duration-200 select-none active:scale-[0.98] ${
                    streamActive
                      ? "bg-mint-500/20 text-mint-400 border border-mint-500/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {streamActive ? (
                      <Pause size={18} className="animate-pulse" />
                    ) : (
                      <Play size={18} />
                    )}
                    {streamActive ? "Release to Stop" : "Hold to Stream Money"}
                  </div>
                </button>

                {streamActive && (
                  <div className="absolute bottom-0 left-0 h-1 bg-mint-500 animate-progress w-full"></div>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-600 font-mono">
              * Try holding the button. This is how gasless payments work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
