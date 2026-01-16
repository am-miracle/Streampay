"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { DashboardStats } from "@/components/DashboardStats";
import { ActiveStreams } from "@/components/ActiveStreams";
import { StreamHistory } from "@/components/StreamHistory";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, DollarSign, Users } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Mock data - in production, fetch from contract events/backend
  const [stats, setStats] = useState({
    totalEarned: "0.00",
    activeStreams: 0,
    totalViewers: 0,
    avgPerStream: "0.00",
  });

  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      // TODO: Fetch real data from contract
      // Mock data for demonstration
      setStats({
        totalEarned: "124.56",
        activeStreams: 3,
        totalViewers: 47,
        avgPerStream: "2.65",
      });

      setActiveStreams([
        {
          id: 1,
          viewer: "0x1234...5678",
          startTime: Date.now() - 300000,
          earned: "0.15",
          rate: "0.02",
        },
        {
          id: 2,
          viewer: "0xabcd...efgh",
          startTime: Date.now() - 180000,
          earned: "0.09",
          rate: "0.02",
        },
      ]);

      setHistory([
        {
          id: 3,
          viewer: "0x9876...4321",
          duration: 600,
          earned: "0.20",
          endTime: Date.now() - 3600000,
        },
        {
          id: 4,
          viewer: "0xfedc...ba98",
          duration: 1200,
          earned: "0.40",
          endTime: Date.now() - 7200000,
        },
      ]);
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-bold bg-linear-to-r from-mint-400 to-mint-500 bg-clip-text text-transparent"
            >
              StreamPay
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-mint-500/10 rounded-full border border-mint-500/20">
              <LayoutDashboard className="w-4 h-4 text-mint-400" />
              <span className="text-sm font-medium text-mint-400">
                Creator Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="text-sm text-zinc-400 hover:text-mint-400 transition-colors"
            >
              Try Demo
            </Link>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!isConnected ? (
          <div className="text-center py-20">
            <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <h2 className="text-3xl font-bold mb-4">Creator Dashboard</h2>
            <p className="text-zinc-400 mb-8">
              Connect your wallet to view your streaming analytics and earnings
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-6">Welcome back!</h1>
              <DashboardStats stats={stats} />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Active Streams</h2>
              <ActiveStreams streams={activeStreams} />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Recent History</h2>
              <StreamHistory history={history} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
