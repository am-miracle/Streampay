"use client";

import { Play, Pause, Loader2 } from "lucide-react";

interface StreamPlayerProps {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  isLoading: boolean;
}

export function StreamPlayer({
  isStreaming,
  onStart,
  onStop,
  isLoading,
}: StreamPlayerProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <div className="relative aspect-video bg-linear-to-br from-mint-900/20 to-zinc-900 flex items-center justify-center">
        {isStreaming ? (
          <div className="absolute inset-0 bg-linear-to-br from-mint-500/10 to-transparent animate-pulse" />
        ) : null}
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
            {isStreaming ? (
              <div className="w-12 h-12 bg-mint-500 rounded-full animate-pulse" />
            ) : (
              <Play className="w-12 h-12 text-zinc-600" />
            )}
          </div>
          <p className="text-zinc-400 text-sm">
            {isStreaming ? "Streaming..." : "Premium Content"}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sample Premium Video</h3>
            <p className="text-sm text-zinc-400">Pay only for what you watch</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isStreaming ? (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-mint-500 text-zinc-950 font-semibold rounded-lg hover:bg-mint-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-mint-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Streaming</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onStop}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Stopping...</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Stop Stream</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Rate</span>
            <span className="font-medium text-mint-400">/bin/sh.02/minute</span>
          </div>
        </div>
      </div>
    </div>
  );
}
