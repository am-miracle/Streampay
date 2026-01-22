"use client";

import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { DashboardStats } from "@/components/DashboardStats";
import { ActiveStreams } from "@/components/ActiveStreams";
import { StreamHistory } from "@/components/StreamHistory";
import {
  useCreatorDashboard,
  useStreamHistory,
} from "@/hooks/useCreatorDashboard";
import { usePendingEarnings } from "@/hooks/useStreamPaymentContract";
import Link from "next/link";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import { useState } from "react";
import { stopStreamGasless, withdrawEarningsGasless } from "@/lib/biconomy";
import { toast } from "sonner";
import { useReadContract } from "wagmi";
import {
  STREAM_PAYMENT_ADDRESSES,
  STREAM_PAYMENT_ABI,
} from "@/lib/contracts/config";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrawSuccess, setIsWithdrawSuccess] = useState(false);
  const [stoppingStreamId, setStoppingStreamId] = useState<string | null>(null);

  const { data: contractOwner } = useReadContract({
    address: STREAM_PAYMENT_ADDRESSES[84532],
    abi: STREAM_PAYMENT_ABI,
    functionName: "owner",
  });

  const creatorAddress = contractOwner as string | undefined;

  const { data: creatorData, isLoading: isLoadingCreator } =
    useCreatorDashboard(creatorAddress);
  const { data: historyData, isLoading: isLoadingHistory } = useStreamHistory(
    creatorAddress,
    { first: 20 }
  );

  const { data: pendingEarnings } = usePendingEarnings(
    creatorAddress as `0x${string}`
  );

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    setIsWithdrawSuccess(false);
    try {
      const result = await withdrawEarningsGasless();
      toast.success("Earnings withdrawn successfully!", {
        description: `Transaction: ${result.txHash.slice(0, 10)}...`,
      });
      setIsWithdrawSuccess(true);
      setTimeout(() => setIsWithdrawSuccess(false), 3000);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to withdraw earnings", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleStopStream = async (streamId: string) => {
    setStoppingStreamId(streamId);
    try {
      const result = await stopStreamGasless(BigInt(streamId));
      toast.success("Stream stopped successfully!", {
        description: `Transaction: ${result.txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error("Stop stream error:", error);
      toast.error("Failed to stop stream", {
        description: error.message || "Please try again",
      });
    } finally {
      setStoppingStreamId(null);
    }
  };

  const stats = {
    totalEarned: creatorData?.totalEarned
      ? formatUnits(BigInt(creatorData.totalEarned), 6)
      : "0.00",
    activeStreams: creatorData?.activeStreamCount || 0,
    totalViewers: creatorData?.totalViewersCount || 0,
    avgPerStream:
      creatorData?.totalStreamCount && creatorData.totalStreamCount > 0
        ? (
            parseFloat(formatUnits(BigInt(creatorData.totalEarned), 6)) /
            creatorData.totalStreamCount
          ).toFixed(2)
        : "0.00",
  };

  const activeStreams =
    creatorData?.streams.map((stream) => ({
      id: stream.streamId,
      viewer: stream.payer,
      startTime: parseInt(stream.startTime) * 1000,
      deposit: formatUnits(BigInt(stream.deposit), 6),
      rate: formatUnits(BigInt(stream.ratePerMinute), 6),
    })) || [];

  const history =
    historyData?.map((stream) => ({
      id: stream.streamId,
      viewer: stream.payer,
      duration: stream.duration ? parseInt(stream.duration) : 0,
      earned: stream.totalPaid
        ? formatUnits(BigInt(stream.totalPaid), 6)
        : "0.00",
      endTime: stream.stoppedAtTimestamp
        ? parseInt(stream.stoppedAtTimestamp) * 1000
        : Date.now(),
    })) || [];

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
        ) : isLoadingCreator || isLoadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-mint-400 animate-spin" />
              <p className="text-zinc-400">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-6">Welcome back!</h1>
              <DashboardStats
                stats={stats}
                pendingEarnings={
                  pendingEarnings
                    ? formatUnits(BigInt(pendingEarnings.toString()), 6)
                    : undefined
                }
                onWithdraw={handleWithdraw}
                isWithdrawing={isWithdrawing}
                isConfirming={false}
                withdrawSuccess={isWithdrawSuccess}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Active Streams</h2>
              <ActiveStreams
                streams={activeStreams}
                onStopStream={handleStopStream}
                stoppingStreamId={stoppingStreamId}
              />
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
