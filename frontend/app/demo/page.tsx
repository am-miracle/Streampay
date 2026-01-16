"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { ArticleReader } from "@/components/ArticleReader";
import { StreamStats } from "@/components/StreamStats";
import {
  useCreateStream,
  useStopStream,
  useStreamedAmount,
  useApproveUSDC,
  useUSDCAllowance,
} from "@/hooks/useStreamPayment";
import { DEMO_CREATOR, RATES } from "@/lib/contracts";
import Link from "next/link";

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const [streamId, setStreamId] = useState<bigint | undefined>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    createStream,
    isPending: isCreating,
    isSuccess: streamCreated,
  } = useCreateStream();
  const { stopStream, isPending: isStopping } = useStopStream();
  const {
    approve,
    isPending: isApproving,
    isSuccess: approved,
  } = useApproveUSDC();
  const { allowance } = useUSDCAllowance(address);
  const { amount: streamedAmount, refetch } = useStreamedAmount(streamId);

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleStartStream = async () => {
    if (!address) return;

    try {
      // Check if approval is needed
      const maxDeposit = RATES.PER_SECOND * BigInt(600); // 10 minutes max

      if (!allowance || allowance < maxDeposit) {
        await approve(maxDeposit * BigInt(2)); // Approve 2x for future streams
        return;
      }

      // Create stream
      const hash = await createStream({
        receiver: DEMO_CREATOR,
        ratePerSecond: RATES.PER_SECOND,
        maxDeposit,
      });

      // In a real app, you'd get the streamId from the transaction receipt/events
      // For demo purposes, we'll use a mock ID
      setStreamId(BigInt(Date.now()));
      setIsStreaming(true);
      setElapsedTime(0);
    } catch (error) {
      console.error("Failed to start stream:", error);
    }
  };

  const handleStopStream = async () => {
    if (!streamId) return;

    try {
      await stopStream(streamId);
      setIsStreaming(false);
    } catch (error) {
      console.error("Failed to stop stream:", error);
    }
  };

  const estimatedCost =
    (RATES.PER_SECOND * BigInt(elapsedTime)) / BigInt(10 ** 6);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-zinc-950/80 backdrop-blur-md border-zinc-800 py-3" : "bg-transparent border-transparent py-6"}`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/demo" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              StreamPay
            </span>
          </Link>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-zinc-400 mb-8">
              Connect your wallet to try StreamPay's pay-per-second content
              access
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-8">
            <div className="space-y-6">
              <ArticleReader
                isStreaming={isStreaming}
                onStart={handleStartStream}
                onStop={handleStopStream}
                isLoading={isCreating || isStopping || isApproving}
                elapsedTime={elapsedTime}
              />
            </div>

            <div className="space-y-6 w-[40%]">
              <StreamStats
                elapsedTime={elapsedTime}
                estimatedCost={estimatedCost}
                isStreaming={isStreaming}
                streamedAmount={streamedAmount}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
