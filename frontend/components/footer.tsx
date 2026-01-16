"use client";

import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-16">
      <div className="container mx-auto px-6">
        <div className="mb-12 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
          <p className="text-sm text-yellow-500/90">
            Currently on testnet. Mainnet deployment coming soon. Built for the
            hackathon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl font-bold tracking-tight text-white">
                StreamPay
              </span>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs mb-6">
              Pay-per-second micropayments with zero gas fees. No subscriptions,
              no minimums, no friction.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/yourusername/streampay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="https://twitter.com/streampay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li>
                <a href="#features" className="hover:text-mint-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-mint-400">
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yourusername/streampay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint-400"
                >
                  GitHub Repo
                </a>
              </li>
              <li>
                <a
                  href="https://mumbai.polygonscan.com/address/0x..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-mint-400"
                >
                  Smart Contract ✓
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-mint-400">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-mint-400">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-mint-400">
                  Integration Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-mint-400">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-8 border-t border-zinc-900 mb-8">
          <div className="text-center">
            <h4 className="text-white font-bold mb-4">Built by</h4>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-400 hover:text-mint-400 transition-colors"
              >
                <Github size={16} />
                <span className="text-sm">Miracle</span>
              </a>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-400 hover:text-mint-400 transition-colors"
              >
                <Twitter size={16} />
                <span className="text-sm">@yourusername</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>&copy; 2026 StreamPay. Open Source MIT License.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-400">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-400">
              Privacy
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Testnet Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
