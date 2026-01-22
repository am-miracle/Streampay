import {
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalEarned: string;
    activeStreams: number;
    totalViewers: number;
    avgPerStream: string;
  };
  pendingEarnings?: string;
  onWithdraw?: () => void;
  isWithdrawing?: boolean;
  isConfirming?: boolean;
  withdrawSuccess?: boolean;
}

export function DashboardStats({
  stats,
  pendingEarnings,
  onWithdraw,
  isWithdrawing,
  isConfirming,
  withdrawSuccess,
}: DashboardStatsProps) {
  const statCards = [
    {
      label: "Total Earned",
      value: `$${stats.totalEarned}`,
      icon: DollarSign,
      color: "mint",
      bgColor: "bg-mint-500/10",
      borderColor: "border-mint-500/20",
      textColor: "text-mint-400",
    },
    {
      label: "Active Streams",
      value: stats.activeStreams,
      icon: Activity,
      color: "green",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      textColor: "text-green-400",
    },
    {
      label: "Total Viewers",
      value: stats.totalViewers,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-400",
    },
    {
      label: "Avg per Stream",
      value: `$${stats.avgPerStream}`,
      icon: TrendingUp,
      color: "yellow",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      textColor: "text-yellow-400",
    },
  ];

  const hasPendingEarnings = pendingEarnings && parseFloat(pendingEarnings) > 0;
  const isProcessing = isWithdrawing || isConfirming;

  return (
    <div className="space-y-6">
      {hasPendingEarnings && (
        <div className="bg-linear-to-r from-mint-500/10 to-mint-600/10 border border-mint-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-mint-400 mb-1">
                Pending Earnings Available
              </h3>
              <p className="text-3xl font-bold mb-2">${pendingEarnings} USDC</p>
              <p className="text-sm text-zinc-400">
                Withdraw your earnings to your wallet
              </p>
            </div>
            <button
              onClick={onWithdraw}
              disabled={isProcessing}
              className="px-6 py-3 bg-mint-500 hover:bg-mint-600 disabled:bg-mint-500/50 text-zinc-950 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isConfirming ? "Confirming..." : "Processing..."}
                </>
              ) : withdrawSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Withdrawn!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Withdraw
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-${stat.color}-500/30 transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
