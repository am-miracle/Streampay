import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalEarned: string
    activeStreams: number
    totalViewers: number
    avgPerStream: string
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Total Earned',
      value: `$${stats.totalEarned}`,
      icon: DollarSign,
      color: 'mint',
      bgColor: 'bg-mint-500/10',
      borderColor: 'border-mint-500/20',
      textColor: 'text-mint-400',
    },
    {
      label: 'Active Streams',
      value: stats.activeStreams,
      icon: Activity,
      color: 'green',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
    },
    {
      label: 'Total Viewers',
      value: stats.totalViewers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      label: 'Avg per Stream',
      value: `$${stats.avgPerStream}`,
      icon: TrendingUp,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
    },
  ]

  return (
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
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
