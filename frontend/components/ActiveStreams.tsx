"use client";

import { useEffect, useState } from "react";
import { Play, Clock, DollarSign, StopCircle, Loader2 } from "lucide-react";

interface Stream {
  id: string;
  viewer: string;
  startTime: number;
  deposit: string;
  rate: string;
}

interface ActiveStreamsProps {
  streams: Stream[];
  onStopStream?: (streamId: string) => void;
  stoppingStreamId?: string | null;
}

export function ActiveStreams({
  streams,
  onStopStream,
  stoppingStreamId,
}: ActiveStreamsProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (streams.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
        <Play className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
        <p className="text-zinc-400">No active streams</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Viewer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Rate/min
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Earned
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {streams.map((stream) => {
              const duration = currentTime - stream.startTime;
              const elapsedMinutes = duration / 60000;
              const currentEarned = (
                elapsedMinutes * parseFloat(stream.rate)
              ).toFixed(2);
              const maxEarned = parseFloat(stream.deposit);
              // Don't show more than deposit
              const displayEarned = Math.min(
                parseFloat(currentEarned),
                maxEarned
              ).toFixed(2);

              return (
                <tr
                  key={stream.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-mint-500 to-mint-600 flex items-center justify-center text-xs font-bold text-zinc-950">
                        {stream.viewer.slice(2, 4).toUpperCase()}
                      </div>
                      <span className="font-mono text-sm">
                        {stream.viewer.slice(0, 6)}...{stream.viewer.slice(-4)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="font-mono">
                        {formatDuration(duration)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">
                    ${stream.rate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-mint-400" />
                      <span className="font-mono font-semibold text-mint-400">
                        {displayEarned}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {onStopStream && (
                      <button
                        onClick={() => onStopStream(stream.id)}
                        disabled={stoppingStreamId === stream.id}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {stoppingStreamId === stream.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Stopping...
                          </>
                        ) : (
                          <>
                            <StopCircle className="w-4 h-4" />
                            Stop
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
