"use client";

import { Clock, DollarSign, TrendingUp } from "lucide-react";

interface StreamStatsProps {
  elapsedTime: number;
  estimatedCost: bigint;
  isStreaming: boolean;
  streamedAmount?: bigint;
}

export function StreamStats({
  elapsedTime,
  estimatedCost,
  isStreaming,
  streamedAmount,
}: StreamStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCost = (cost: bigint) => {
    return `$${(Number(cost) / 1000000).toFixed(6)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-lg font-semibold mb-6">Stream Statistics</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mint-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-mint-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Elapsed Time</p>
                <p className="text-2xl font-bold font-mono">
                  {formatTime(elapsedTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mint-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-mint-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Current Cost</p>
                <p className="text-2xl font-bold font-mono">
                  {formatCost(estimatedCost)}
                </p>
              </div>
            </div>
          </div>

          {streamedAmount !== undefined && (
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Actual Streamed</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatCost(streamedAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
