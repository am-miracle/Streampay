'use client'

import { ArrowRight, Zap, Shield, Layers, CheckCircle } from 'lucide-react'

interface TechnicalFlowProps {
  isStreaming: boolean
  currentStep?: number
}

export function TechnicalFlow({ isStreaming, currentStep = 0 }: TechnicalFlowProps) {
  const steps = [
    {
      icon: Shield,
      label: 'User Signs',
      description: 'Meta-transaction signed (no gas)',
      color: 'mint',
    },
    {
      icon: Layers,
      label: 'Bundler Collects',
      description: 'Off-chain aggregation',
      color: 'blue',
    },
    {
      icon: Zap,
      label: 'Paymaster Sponsors',
      description: 'Gas fees covered',
      color: 'yellow',
    },
    {
      icon: CheckCircle,
      label: 'On-Chain Settlement',
      description: 'Batched transaction',
      color: 'green',
    },
  ]

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-mint-400" />
        Gasless Transaction Flow
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = isStreaming && index <= currentStep
          const colorMap: Record<string, string> = {
            mint: 'border-mint-500/20 bg-mint-500/10 text-mint-400',
            blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
            yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
            green: 'border-green-500/20 bg-green-500/10 text-green-400',
          }
          const inactiveColor = 'border-zinc-700 bg-zinc-800/30 text-zinc-500'

          return (
            <div key={index}>
              <div className={`p-4 rounded-lg border transition-all duration-500 ${isActive ? colorMap[step.color] : inactiveColor}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? '' : 'opacity-50'}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{step.label}</h4>
                      {isActive && (
                        <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? 'opacity-90' : 'opacity-50'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className={`w-5 h-5 transition-colors ${isActive ? 'text-mint-400' : 'text-zinc-700'}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isStreaming && (
        <div className="mt-6 p-4 bg-mint-500/10 border border-mint-500/20 rounded-lg">
          <p className="text-sm text-mint-400 font-medium">
            ✓ Stream active - payments processing gaslessly every second
          </p>
        </div>
      )}

      {!isStreaming && (
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <p className="text-sm text-zinc-400">
            💡 Start streaming to see the gasless flow in action
          </p>
        </div>
      )}
    </div>
  )
}
