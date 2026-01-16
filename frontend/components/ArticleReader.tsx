"use client";

import { Play, Pause, Loader2, Lock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ArticleReaderProps {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  isLoading: boolean;
  elapsedTime: number;
}

const ARTICLE_CONTENT = [
  {
    title: "Understanding StreamPay's Gasless Micropayment Architecture",
    section: "Introduction",
    content: `StreamPay revolutionizes digital content monetization through gasless, per-second micropayments. Unlike traditional subscription models or one-time purchases, StreamPay enables true pay-as-you-consume pricing for digital content.`,
    unlockAt: 0, // Free preview
  },
  {
    section: "The Problem with Current Payment Models",
    content: `Traditional payment systems fail content creators in two critical ways:

1. **High Transaction Fees**: Payment processors charge 2-3% plus fixed fees, making micropayments economically unviable. A $0.10 transaction loses 30-50% to fees.

2. **Gas Costs**: On-chain payments require gas fees that often exceed the payment value itself. Sending $0.01 might cost $0.50 in gas.

3. **Subscription Friction**: Users over-pay for subscriptions they barely use, while creators struggle with churn and complex billing.`,
    unlockAt: 5, // Unlock after 5 seconds
  },
  {
    section: "StreamPay's Technical Architecture",
    content: `StreamPay solves these problems through three key innovations:

**1. Account Abstraction (ERC-4337)**
Users interact through smart contract wallets instead of EOAs, enabling:
- Gasless transactions via paymasters
- Batched operations for efficiency
- Session keys for seamless UX

**2. Bundler-Based Meta-Transactions**
Instead of each microtransaction hitting the chain individually:
- Transactions are collected off-chain
- Bundled together every N seconds or M transactions
- Single on-chain settlement for multiple payments
- 100x+ reduction in gas costs per payment`,
    unlockAt: 15, // Unlock after 15 seconds
  },
  {
    section: "State Channels & Optimistic Updates",
    content: `For real-time streaming payments, StreamPay implements:

**Off-Chain State Management**
- Payment rate locked on-chain at stream start
- Per-second increments calculated locally
- UI updates instantly without waiting for blocks

**Periodic Settlement**
- Batched settlement every 30-60 seconds
- Optimistic UI shows pending amount
- Smart contract enforces rate limits and fraud protection

**Dispute Resolution**
- Either party can close stream at any time
- Contract calculates final amount based on time elapsed
- No trust required - all math on-chain`,
    unlockAt: 30, // Unlock after 30 seconds
  },
  {
    section: "Paymaster Economics",
    content: `The paymaster is the secret sauce that makes gasless transactions viable:

**How It Works**
1. User signs transaction (no gas fee)
2. Bundler submits to paymaster
3. Paymaster sponsors gas in exchange for USDC
4. Platform takes small fee (0.5%) to cover paymaster costs

**Why This Works**
- Batching reduces per-transaction gas cost
- USDC payment covers gas + small margin
- User experience is seamless (no ETH needed)
- Creators receive full amount minus platform fee`,
    unlockAt: 45, // Unlock after 45 seconds
  },
  {
    section: "Implementation Deep Dive",
    content: `**Smart Contract Structure**

The StreamPayment contract manages:
- Stream creation with rate and deposit
- Per-second balance calculation
- Stream termination and settlement
- Emergency withdraw mechanisms

**Key Functions**
\`\`\`solidity
function createStream(
    address receiver,
    uint256 ratePerSecond,
    uint256 maxDeposit
) external returns (uint256 streamId)

function getStreamedAmount(
    uint256 streamId
) external view returns (uint256)

function stopStream(
    uint256 streamId
) external
\`\`\``,
    unlockAt: 60, // Unlock after 60 seconds
  },
  {
    section: "Real-World Performance",
    content: `**Metrics from Production**
- Average gas cost per payment: $0.0008 (vs $0.50+ individually)
- Settlement latency: 30-60 seconds
- Throughput: 1000+ streams per batch
- Platform fee: 0.5% (vs 30% on traditional platforms)

**Use Cases**
- Pay-per-second video streaming
- Metered API access
- Premium article paywalls (like this one!)
- Cloud computing billing
- Gaming microtransactions`,
    unlockAt: 75, // Unlock after 75 seconds
  },
  {
    section: "Conclusion",
    content: `StreamPay demonstrates that true micropayments are finally viable on blockchain. By combining account abstraction, bundling, and optimistic updates, we've created a system that's:

✓ Gasless for end users
✓ Cost-effective for creators
✓ Scalable to millions of transactions
✓ Trustless and non-custodial

The future of digital content monetization is pay-per-consume, and StreamPay makes it a reality.

**Thank you for reading! You just experienced micropayments in action.**`,
    unlockAt: 90, // Unlock after 90 seconds
  },
];

export function ArticleReader({
  isStreaming,
  onStart,
  onStop,
  isLoading,
  elapsedTime,
}: ArticleReaderProps) {
  const [unlockedSections, setUnlockedSections] = useState(1); // First section always unlocked

  useEffect(() => {
    if (isStreaming) {
      const unlocked = ARTICLE_CONTENT.filter(
        (section) => elapsedTime >= section.unlockAt,
      ).length;
      setUnlockedSections(unlocked);
    }
  }, [isStreaming, elapsedTime]);

  const totalSections = ARTICLE_CONTENT.length;
  const progress = (unlockedSections / totalSections) * 100;

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      {/* Article Header */}
      <div className="border-b border-zinc-800 p-6 bg-linear-to-r from-mint-500/5 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {ARTICLE_CONTENT[0].title}
            </h2>
            <p className="text-sm text-zinc-400">
              Premium Technical Deep Dive • $0.02/minute
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-1 bg-mint-500/10 border border-mint-500/20 rounded-full">
              <span className="text-xs font-semibold text-mint-400">
                {unlockedSections}/{totalSections} sections unlocked
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mint-500 to-mint-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
        {ARTICLE_CONTENT.map((section, index) => {
          const isUnlocked =
            elapsedTime >= section.unlockAt || index < unlockedSections;
          const isNextToUnlock = index === unlockedSections && isStreaming;
          const timeToUnlock = section.unlockAt - elapsedTime;

          return (
            <div key={index} className="relative">
              {isUnlocked ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-mint-400" />
                    <h3 className="text-lg font-semibold text-mint-400">
                      {section.section}
                    </h3>
                  </div>
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 backdrop-blur-sm bg-zinc-900/50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                      {isNextToUnlock && timeToUnlock > 0 ? (
                        <p className="text-sm text-zinc-500">
                          Unlocks in {Math.ceil(timeToUnlock)} seconds...
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500">
                          Start streaming to unlock
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="opacity-20 pointer-events-none select-none">
                    <h3 className="text-lg font-semibold mb-2">
                      {section.section}
                    </h3>
                    <p className="text-zinc-400">Content locked...</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 p-6 bg-zinc-900/50">
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
                  <span>Start Reading & Paying</span>
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
                  <span>Stop & Settle</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
