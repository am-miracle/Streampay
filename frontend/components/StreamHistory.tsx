import { History, Clock, DollarSign } from "lucide-react";

interface HistoryItem {
  id: string;
  viewer: string;
  duration: number;
  earned: string;
  endTime: number;
}

interface StreamHistoryProps {
  history: HistoryItem[];
}

export function StreamHistory({ history }: StreamHistoryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffHrs > 24) {
      return date.toLocaleDateString();
    } else if (diffHrs > 0) {
      return `${diffHrs}h ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
        <History className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
        <p className="text-zinc-400">No stream history yet</p>
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
                Earned
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                Ended
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {history.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {item.viewer.slice(2, 4).toUpperCase()}
                    </div>
                    <span className="font-mono text-sm">
                      {item.viewer.slice(0, 6)}...{item.viewer.slice(-4)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="font-mono">
                      {formatDuration(item.duration)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-mint-400" />
                    <span className="font-mono font-semibold text-mint-400">
                      {item.earned}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {formatTime(item.endTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
