"use client";

import { Badge } from "@/components/ui/badge";
import { Globe, ShieldCheck, Cpu } from "lucide-react";

export function Architecture() {
  return (
    <section id="architecture" className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline">Under the Hood</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-6 mb-4">
            Account Abstraction Architecture
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We use ERC-4337 to separate the signer from the payer, enabling a
            true gasless experience.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden md:block"
            style={{ zIndex: 0 }}
          >
            <path
              d="M200 100 L 500 100 L 500 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-700"
              strokeDasharray="5,5"
            />
            <path
              d="M800 100 L 500 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-700"
              strokeDasharray="5,5"
            />
            <path
              d="M500 280 L 500 350"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-mint-500"
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4 relative group hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-400 border border-zinc-700">
                  Client Side
                </div>
                <Globe className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-1">User Browser</h4>
                <p className="text-xs text-zinc-500">
                  Sign intention (off-chain)
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center pt-12 md:pt-0">
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4 relative group hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(45,212,191,0.1)] border-mint-500/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-mint-900 text-xs px-2 py-1 rounded text-mint-400 border border-mint-700">
                  Relayer
                </div>
                <ShieldCheck className="w-8 h-8 text-mint-400 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-1">
                  Biconomy Paymaster
                </h4>
                <p className="text-xs text-zinc-500">
                  Validates & Sponsors Gas
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4 relative group hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-400 border border-zinc-700">
                  Chain
                </div>
                <Cpu className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-white font-bold mb-1">Polygon Contract</h4>
                <p className="text-xs text-zinc-500">
                  Settles StreamPayment.sol
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-4xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-10 font-mono text-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-zinc-500 ml-2">integration_example.js</span>
          </div>
          <div className="text-zinc-400 overflow-x-auto">
            <span className="text-purple-400">const</span> tx ={" "}
            <span className="text-purple-400">await</span> streamContract.
            <span className="text-blue-400">createStream</span>(<br />
            &nbsp;&nbsp;creatorAddress,
            <br />
            &nbsp;&nbsp;ratePerSecond,{" "}
            <span className="text-zinc-600">// 0.0003 USDC</span>
            <br />
            &nbsp;&nbsp;maxDeposit
            <br />
            );
            <br />
            <span className="text-zinc-500">
              // Paymaster automatically intercepts and pays gas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
