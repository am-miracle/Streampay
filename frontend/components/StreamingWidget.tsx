"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatUnits } from "viem";

interface StreamingWidgetProps {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  onExtend: () => void;
  isLoading: boolean;
  elapsedTime: number;
  streamedAmount: bigint;
  totalDeposit: bigint;
  ratePerMinute: number;
  creatorAddress: string;
  streamId: bigint | null;
}

export function StreamingWidget({
  isStreaming,
  onStart,
  onStop,
  onExtend,
  isLoading,
  elapsedTime,
  streamedAmount,
  totalDeposit,
  ratePerMinute,
  creatorAddress,
  streamId,
}: StreamingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const spent = Number(formatUnits(streamedAmount, 6));
  const total = Number(formatUnits(totalDeposit, 6));
  const remaining = total - spent;
  const percentageUsed = total > 0 ? (spent / total) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isStreaming && isMinimized) {
      setIsMinimized(false);
      setIsExpanded(true);
    }
  }, [isStreaming, isMinimized]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:border-mint-500/50 transition-all duration-200 flex items-center gap-2"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isStreaming ? "bg-mint-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span className="text-sm font-medium">
            {isStreaming ? `$${spent.toFixed(4)}` : "Streaming Paused"}
          </span>
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 animate-in slide-in-from-bottom-4">
      <div
        className={`bg-zinc-900 border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isStreaming
            ? "border-mint-500/50 shadow-mint-500/20 shadow-2xl"
            : "border-zinc-800"
        }`}
      >
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-900/50">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isStreaming ? "bg-mint-400 animate-pulse" : "bg-zinc-600"
              }`}
            />
            <span className="text-sm font-semibold">
              {isStreaming ? "Streaming Active" : "Stream Paused"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Amount Spent</div>
              <div
                className={`text-2xl font-bold font-mono ${
                  isStreaming ? "text-mint-400 animate-pulse" : "text-white"
                }`}
              >
                ${spent.toFixed(4)}
              </div>
              {isStreaming && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-mint-400 rounded-full animate-ping"></div>
                  <span className="text-xs text-mint-400">Live</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 mb-1">Time</div>
              <div
                className={`text-lg font-mono font-semibold ${
                  isStreaming ? "text-mint-400" : "text-zinc-400"
                }`}
              >
                {formatTime(elapsedTime)}
              </div>
              {isStreaming && (
                <div className="text-xs text-zinc-500 mt-1">Streaming...</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Balance</span>
              <span className={isStreaming ? "text-mint-400 font-medium" : ""}>
                ${remaining.toFixed(4)} / ${total.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  isStreaming ? "animate-pulse" : ""
                } ${
                  percentageUsed > 80
                    ? "bg-linear-to-r from-red-500 to-red-600"
                    : percentageUsed > 50
                    ? "bg-linear-to-r from-yellow-500 to-orange-500"
                    : "bg-linear-to-r from-mint-500 to-mint-400"
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
              {isStreaming && percentageUsed < 100 && (
                <div
                  className="absolute top-0 h-full w-1 bg-white/80 animate-pulse"
                  style={{ left: `${Math.min(percentageUsed, 100)}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 py-4 border-t border-zinc-800 space-y-4 animate-in slide-in-from-top-2">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Rate</span>
                <span className="font-medium">
                  ${ratePerMinute.toFixed(2)}/min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Creator</span>
                <span className="font-mono text-xs">
                  {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
                </span>
              </div>
              {streamId && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stream ID</span>
                  <span className="font-mono text-xs">
                    #{streamId.toString()}
                  </span>
                </div>
              )}
            </div>

            {percentageUsed > 80 && isStreaming && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400 font-medium">
                  ⚠️ Low balance! Extend your stream to continue reading.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {!isStreaming ? (
                <button
                  onClick={onStart}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-mint-500 text-zinc-950 font-semibold rounded-lg hover:bg-mint-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-mint-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Start Streaming</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={onExtend}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-100 font-medium rounded-lg hover:bg-zinc-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? "Extending..." : "Extend"}
                  </button>
                  <button
                    onClick={onStop}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Stopping...</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        <span className="text-sm">Stop</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
