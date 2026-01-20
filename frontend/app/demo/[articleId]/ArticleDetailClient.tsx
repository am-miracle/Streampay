"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { ArticleReader } from "@/components/ArticleReader";
import { StreamingWidget } from "@/components/StreamingWidget";
import {
  useBiconomyGasless,
  useCreateStreamGasless,
  useStopStreamGasless,
  useExtendStreamGasless,
  useStreamData,
} from "@/hooks/useBiconomyGasless";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Article } from "@/lib/articles";
import { ARTICLE_CONTENT } from "@/lib/article-content";

interface ArticleDetailClientProps {
  article: Article;
}

export default function ArticleDetailClient({
  article,
}: ArticleDetailClientProps) {
  const { isConnected, chain } = useAccount();

  const [streamId, setStreamId] = useState<bigint | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const {
    smartAccountAddress,
    isInitializing,
    isReady,
    error: initError,
  } = useBiconomyGasless();
  const {
    createStream,
    isPending: isCreating,
    error: createError,
  } = useCreateStreamGasless();
  const {
    stopStream,
    isPending: isStopping,
    error: stopError,
  } = useStopStreamGasless();
  const {
    extendStream,
    isPending: isExtending,
    error: extendError,
  } = useExtendStreamGasless();
  const { stream, streamedAmount, refetch } = useStreamData(streamId);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        refetch();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming, refetch]);

  useEffect(() => {
    if (stream && streamedAmount >= stream.deposit) {
      setIsStreaming(false);
    }
  }, [stream, streamedAmount]);

  const handleStartStream = async () => {
    if (!isReady) {
      alert("Smart account is not ready. Please wait...");
      return;
    }

    // Check if user is on Base Sepolia
    if (chain?.id !== 84532) {
      alert(
        `Please switch to Base Sepolia network. Current network: ${
          chain?.name || "Unknown"
        } (${chain?.id})`
      );
      return;
    }

    try {
      console.log("Starting stream on chain:", chain?.id, chain?.name);
      const result = await createStream(
        article.authorAddress,
        article.ratePerMinute,
        article.estimatedCost
      );

      setStreamId(result.streamId);
      setIsStreaming(true);
      setElapsedTime(0);
    } catch (error) {
      console.error("Failed to start stream:", error);
      alert(
        `Failed to start stream: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleStopStream = async () => {
    if (!streamId) return;

    try {
      await stopStream(streamId);
      setIsStreaming(false);
    } catch (error) {
      console.error("Failed to stop stream:", error);
      alert(
        `Failed to stop stream: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleExtendStream = async () => {
    if (!streamId) return;

    try {
      await extendStream(streamId, article.estimatedCost);
      alert("Stream extended successfully!");
    } catch (error) {
      console.error("Failed to extend stream:", error);
      alert(
        `Failed to extend stream: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-zinc-950/80 backdrop-blur-md border-zinc-800 py-3"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            href="/demo"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Articles</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              StreamPay
            </span>
          </Link>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto mb-8 pt-8">
          <div
            className="h-64 rounded-2xl mb-8 relative overflow-hidden"
            style={{ background: article.thumbnail }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-zinc-950/80 backdrop-blur-sm border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300">
                  {article.category}
                </span>
                <div className="flex items-center gap-1 px-3 py-1 bg-zinc-950/80 backdrop-blur-sm border border-mint-500/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-mint-400">
                    Live Streaming Payment
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {article.title}
              </h1>
              <p className="text-zinc-300">{article.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-8">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-zinc-500 block mb-1">Creator</span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs text-zinc-400">
                    {article.authorAddress.slice(0, 6)}...
                    {article.authorAddress.slice(-4)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Read Time</span>
                <span className="font-medium">{article.readTime} min</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Rate</span>
                <span className="font-medium text-mint-400">
                  ${article.ratePerMinute.toFixed(2)}/min
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-xs block mb-1">
                Estimated Cost
              </span>
              <span className="text-2xl font-bold">
                ${article.estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-zinc-400 mb-8">
              Connect your wallet to access this content with gasless
              pay-per-second streaming
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <>
            {!smartAccountAddress && !initError && (
              <div className="max-w-4xl mx-auto mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Initializing Gasless Account
                </h3>
                <p className="text-sm text-zinc-400">
                  Setting up your smart account for gasless transactions...
                </p>
              </div>
            )}

            {initError && (
              <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <p className="font-semibold">Initialization Error</p>
                <p className="text-sm">{initError}</p>
              </div>
            )}

            {(createError || stopError || extendError) && (
              <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <p className="font-semibold">Transaction Error</p>
                <p className="text-sm">
                  {createError || stopError || extendError}
                </p>
              </div>
            )}

            {!isStreaming && smartAccountAddress && (
              <div className="max-w-4xl mx-auto mb-8 p-6 bg-linear-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Ready to Start Streaming
                    </h3>
                    <p className="text-sm text-zinc-300">
                      Content is locked. Start streaming to unlock sections as
                      you read.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-sm font-semibold text-emerald-400">
                        No Gas Fees
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto">
              <ArticleReader
                isStreaming={isStreaming}
                elapsedTime={elapsedTime}
                articleContent={ARTICLE_CONTENT[article.id] || []}
                articleTitle={article.title}
              />
            </div>

            {smartAccountAddress && (
              <StreamingWidget
                isStreaming={isStreaming}
                onStart={handleStartStream}
                onStop={handleStopStream}
                onExtend={handleExtendStream}
                isLoading={
                  isCreating || isStopping || isExtending || isInitializing
                }
                elapsedTime={elapsedTime}
                streamedAmount={streamedAmount}
                totalDeposit={stream?.deposit || BigInt(0)}
                ratePerMinute={article.ratePerMinute}
                creatorAddress={article.authorAddress}
                streamId={streamId}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
