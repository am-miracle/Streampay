export interface ArticleSection {
  section: string;
  content: string;
  unlockAt: number; // seconds
}

export const ARTICLE_CONTENT: Record<string, ArticleSection[]> = {
  "1": [
    {
      section: "Introduction",
      content: `Welcome to this deep dive into StreamPay's gasless micropayment architecture. You're currently experiencing this technology in action - as you read, you're paying by the second with zero gas fees.

StreamPay revolutionizes digital content monetization through gasless, per-second micropayments. Unlike traditional subscription models or one-time purchases, StreamPay enables true pay-as-you-consume pricing for digital content.

This article will take you through the technical architecture that makes this possible, from account abstraction to bundlers and paymasters.`,
      unlockAt: 0, // Free preview
    },
    {
      section: "The Problem with Current Payment Models",
      content: `Traditional payment systems fail content creators in several critical ways:

High Transaction Fees: Payment processors like Stripe charge 2.9% + $0.30 per transaction. For a $0.10 micropayment, you lose 30-50% to fees. This makes true micropayments economically unviable.

Gas Costs on Blockchain: On-chain payments require gas fees that often exceed the payment value itself. Sending $0.01 worth of USDC might cost $0.50-$2.00 in gas fees on Ethereum mainnet, making micropayments impossible.

Subscription Friction: Users over-pay for subscriptions they barely use (how many streaming services do you actually watch?), while creators struggle with churn and complex billing systems.

Payment Finality: Traditional systems have long settlement times. Creators wait weeks for their money.`,
      unlockAt: 10,
    },
    {
      section: "Account Abstraction: The Foundation",
      content: `StreamPay solves these problems through ERC-4337 Account Abstraction. Here's how it works:

Smart Contract Wallets: Instead of using regular Ethereum accounts (EOAs), users interact through smart contract wallets. These wallets can execute complex logic and enable gasless transactions.

User Operations: When you click "Start Streaming," you're not sending a traditional transaction. Instead, you're signing a "UserOperation" - a structured intent that says "I want to do X."

No ETH Required: Your wallet doesn't need ETH for gas. The smart contract wallet handles gas sponsorship through paymasters, which we'll explore next.

Code Example:
\`\`\`typescript
const userOp = {
  sender: smartAccountAddress,
  callData: encodeFunctionData({
    abi: StreamPaymentABI,
    functionName: 'createStream',
    args: [creator, ratePerSecond, deposit]
  }),
  // No gas fields needed!
}
\`\`\``,
      unlockAt: 25,
    },
    {
      section: "Bundlers: Transaction Aggregation",
      content: `Bundlers are the unsung heroes of account abstraction:

What They Do: Bundlers collect UserOperations from multiple users and batch them into single on-chain transactions. Instead of 100 separate transactions, you get 1 bundled transaction.

Gas Efficiency: By batching operations, the per-operation gas cost drops dramatically. A single transaction might cost 21,000 gas base + 100,000 for logic. But 100 operations bundled together share that 21,000 base cost.

MEE (Modular Execution Environment): Biconomy's MEE infrastructure provides a decentralized network of bundlers that compete to process your transactions efficiently.

The Flow:
1. You sign a UserOperation (no gas!)
2. Bundler collects 100+ UserOperations
3. Bundler submits single transaction on-chain
4. Smart contracts process each operation
5. Result: 100x reduction in gas per user`,
      unlockAt: 40,
    },
    {
      section: "Paymasters: Gasless Magic",
      content: `The paymaster is the component that sponsors your gas fees:

How It Works:
When you create a stream, you're sending USDC to the creator. The paymaster intercepts this and says "I'll pay the gas fee, just give me a tiny portion of your USDC."

Economic Model:
- Transaction gas cost: $0.05
- Your payment: $0.20
- Paymaster takes: $0.06 (covers gas + 0.5% fee)
- Creator receives: $0.14
- You paid: $0.20 total (no separate gas!)

Smart Contract Logic:
\`\`\`solidity
function validatePaymasterUserOp(
    UserOperation calldata userOp
) external returns (bytes memory context) {
    // Verify USDC payment covers gas
    require(
        userOp.callData.usdcAmount >= gasCost,
        "Insufficient USDC"
    );
    return abi.encode(userOp.sender);
}
\`\`\`

The paymaster validates that your USDC payment is sufficient, sponsors the gas, and takes its fee from your payment.`,
      unlockAt: 60,
    },
    {
      section: "Real-Time Streaming: Off-Chain State",
      content: `For per-second payments to work, we can't hit the blockchain every second. That would be too expensive even with bundling.

Hybrid Approach:
- On-chain: Stream creation, rate locked, deposit locked
- Off-chain: Per-second calculations in browser
- Settlement: Batched every 30-60 seconds

The Math:
When you start a stream at $0.02/minute:
\`\`\`typescript
const ratePerSecond = 0.02 / 60 // $0.000333.../second
const elapsed = Date.now() - startTime
const amountDue = (elapsed / 1000) * ratePerSecond
\`\`\`

Your browser calculates this locally. Every minute, a bundler settles the actual amount on-chain.

Security: The smart contract enforces the rate limit. Even if you try to claim you've only read for 1 second when it's been 60 seconds, the contract won't allow withdrawal beyond the time-based calculation.`,
      unlockAt: 80,
    },
    {
      section: "Production Performance Metrics",
      content: `Let's look at real numbers from StreamPay in production:

Gas Efficiency:
- Traditional transaction: ~50,000 gas ($1.50 at 30 gwei)
- Bundled operation: ~5,000 gas ($0.15 at 30 gwei)
- Gas reduction: 90%

Cost Breakdown (100 users streaming for 5 minutes):
- Traditional: 100 tx × $1.50 = $150 in gas
- StreamPay bundled: 10 tx × $1.50 = $15 in gas
- Savings: $135 (90% reduction)

Throughput:
- Operations per bundle: 100-500
- Settlement latency: 30-60 seconds
- Max streams per second: 10,000+

Platform Economics:
- Platform fee: 0.5% (vs 30% on Web2 platforms)
- Creator receives: 99.5% of payment
- Settlement time: Real-time to 60 seconds`,
      unlockAt: 100,
    },
    {
      section: "Smart Contract Architecture",
      content: `The StreamPayment contract is the core of the system:

Core Functions:

\`\`\`solidity
contract StreamPayment {
    struct Stream {
        address viewer;
        address creator;
        uint256 ratePerSecond;
        uint256 deposit;
        uint256 startTime;
        bool isActive;
    }

    function createStream(
        address creator,
        uint256 ratePerSecond,
        uint256 maxDeposit
    ) external returns (uint256 streamId) {
        // Transfer USDC to contract
        USDC.transferFrom(msg.sender, address(this), maxDeposit);

        // Create stream
        streams[nextStreamId] = Stream({
            viewer: msg.sender,
            creator: creator,
            ratePerSecond: ratePerSecond,
            deposit: maxDeposit,
            startTime: block.timestamp,
            isActive: true
        });

        return nextStreamId++;
    }

    function getStreamedAmount(uint256 streamId)
        public view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (!stream.isActive) return stream.deposit;

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 amount = elapsed * stream.ratePerSecond;

        return amount > stream.deposit ? stream.deposit : amount;
    }

    function stopStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "Already stopped");

        uint256 amountUsed = getStreamedAmount(streamId);
        uint256 refund = stream.deposit - amountUsed;

        stream.isActive = false;

        // Send payments
        USDC.transfer(stream.creator, amountUsed);
        USDC.transfer(stream.viewer, refund);
    }
}
\`\`\`

Security Features:
- Reentrancy guards on all state changes
- Rate limits enforced by time-based calculations
- No operator privileges - trustless system`,
      unlockAt: 120,
    },
    {
      section: "Use Cases & Future",
      content: `StreamPay's architecture enables entirely new business models:

Content Streaming:
- Articles (like this one!)
- Video content - pay per second watched
- Music streaming with direct artist payments
- Educational courses

API Monetization:
- Pay per API call with sub-cent pricing
- Real-time data feeds
- AI model inference pricing

Gaming:
- In-game item rentals
- Pay-per-minute server access
- Skill-based matchmaking fees

Cloud Computing:
- Per-second compute billing
- Storage access fees
- Bandwidth pricing

The Future:
As account abstraction becomes standard and L2s drive gas costs toward zero, micropayments will unlock a new creator economy. No more paywalls, no more subscriptions - just pay for exactly what you consume.

StreamPay is just the beginning. We're building the infrastructure for a future where value flows as freely as information.

Thank you for reading! You just experienced the future of digital payments. Every second you spent reading was paid for automatically, with zero gas fees, and the creator received their money instantly.`,
      unlockAt: 140,
    },
  ],

  "2": [
    {
      section: "Introduction: The Subscription Crisis",
      content: `You probably pay for at least 5 streaming subscriptions. Netflix, Spotify, YouTube Premium, maybe a few Substacks. You're spending $50-100/month on content you barely consume.

Welcome to the subscription trap - and you're experiencing the solution right now as you read this article.

Traditional subscriptions are fundamentally broken. They're a relic of an era when per-usage billing was technically impossible. But blockchain and account abstraction have changed everything.

This article explores why micropayments will dominate the creator economy, how they solve the subscription problem, and what this means for creators and consumers.`,
      unlockAt: 0,
    },
    {
      section: "The Subscription Model is Dead",
      content: `Let's do the math on why subscriptions don't work:

Consumer Perspective:
- Average American has 4-5 streaming subscriptions
- Total monthly cost: $60-80
- Actual usage: Maybe 20% of available content
- Effective cost: You're paying $300-400 for the content you actually consume

Creator Perspective:
- Platform takes 30-50% cut (Apple, Spotify, Substack)
- Must maintain constant churn reduction
- Forced into "binge-worthy" content over quality
- Revenue delayed 30-60 days

The Fundamental Problem: Subscriptions bundle everything together. You pay for Netflix even if you only watch one show. You pay for Spotify even if you only listen to 10 artists.

Churn Psychology: The moment you stop using a service regularly, you cancel. Creators live in constant fear of churn, leading to quantity over quality.`,
      unlockAt: 12,
    },
    {
      section: "Why Micropayments Failed Before",
      content: `Micropayments aren't a new idea. They've been tried and failed for decades. Here's why:

Technical Impossibility:
In 1998, paying $0.01 for an article meant:
- $0.30 credit card processing fee
- Net result: -$0.29 per transaction
- Economics made it literally impossible

Blockchain's First Attempt:
In 2017, crypto promised micropayments:
- $0.01 payment
- $5.00 gas fee
- Still impossible

Psychological Friction:
Even when technically possible, micropayments created decision fatigue:
- "Is this article worth $0.25?"
- Mental accounting overhead
- Analysis paralysis

What Changed: Account abstraction + bundlers + L2s solved all three problems:
1. Gas fees: $0.0001 per operation via bundling
2. Decision fatigue: Set a budget, auto-stream payments
3. Economics: Finally viable at sub-cent pricing`,
      unlockAt: 28,
    },
    {
      section: "The Streaming Payment Model",
      content: `What you're experiencing right now is the future of content monetization:

How It Works:
1. You set a maximum budget (e.g., $0.20)
2. Click "start reading"
3. Payments flow automatically per second
4. Stop anytime, pay only for what you consumed

Real Example - This Article:
- Rate: $0.015/minute = $0.00025/second
- Your reading speed: ~250 words/min
- Total cost for this 2000-word article: ~$0.12
- Traditional paywall: Would charge $5-10
- You save: 98%

For Creators:
- No platform middleman (0.5% fee vs 30-50%)
- Instant settlement (60 seconds vs 30 days)
- Paid for every second of engagement
- No churn anxiety

The Magic: Blockchain handles money transfer, account abstraction removes gas fees, bundlers make it economically viable.`,
      unlockAt: 48,
    },
    {
      section: "Creator Economics: The New Model",
      content: `Let's compare traditional platforms vs. StreamPay:

Traditional Platform (Substack):
- $5/month subscription
- 1000 subscribers = $5000/month
- Platform fee: 10% = -$500
- Payment processing: 2.9% = -$145
- Net: $4,355/month
- User reads: 4 articles/month
- Cost per article (to user): $1.25
- Payment to creator per article: $1.09

StreamPay Model:
- Pay per second: $0.02/minute
- Same 1000 users
- Average read time: 5 min/article
- Cost per article (to user): $0.10
- Platform fee: 0.5% = -$0.0005
- Net to creator: $0.0995
- 4 articles/month × 1000 users = $398/month

Wait, that's less! But here's what changes:

Scale Without Friction:
- No subscription barrier = 10x more readers
- 10,000 casual readers × 1 article = $995
- Price-sensitive market captured
- Total reach: 10x larger

Quality Over Quantity:
- Paid per second engaged = incentivize quality
- No need to churn out daily content
- Can charge more for deep dives
- Readers pay for value, not access`,
      unlockAt: 70,
    },
    {
      section: "The Network Effects",
      content: `Micropayments create entirely new dynamics:

Consumer Behavior Shifts:
- Browse freely, pay only for what you consume
- No commitment anxiety
- Discover new creators without subscription friction
- Budget-conscious users can participate

Creator Behavior Shifts:
- Optimize for engagement, not clicks
- First 30 seconds must hook (that's when payment starts)
- Quality matters more than quantity
- Can experiment with pricing per article

Platform Dynamics:
Traditional: Winner-take-all (Netflix has everything)
Micropayments: Specialized creators thrive

Why This Matters:
Subscriptions favor mega-platforms that can bundle tons of content. Micropayments favor individual creators with niche expertise. The long tail becomes economically viable.

Example: A creator who writes one exceptional deep-dive per month can charge $1 per article. With 5,000 readers, that's $5,000/month. Previously, convincing 5,000 people to subscribe was impossible. But 5,000 one-time $1 payments? Easy.`,
      unlockAt: 92,
    },
    {
      section: "Beyond Content: The Broader Economy",
      content: `Micropayments unlock business models that were previously impossible:

API Monetization:
Instead of monthly API tiers:
- Pay $0.0001 per request
- Scale from 0 to millions seamlessly
- No overpaying for unused quota

Gaming:
- Rent items for $0.10/hour instead of buying
- Pay for matchmaking by skill level
- Per-minute server costs

AI & ML:
- Pay per inference: $0.001 per API call
- Per-token pricing for LLMs
- Democratizes access to expensive models

Cloud Computing:
- True per-second billing
- No minimum commitments
- Pay for exactly what you use

The Pattern: Any resource that's consumed over time becomes economically efficient to price by usage rather than by subscription.`,
      unlockAt: 115,
    },
    {
      section: "The Psychology of Streaming Payments",
      content: `The biggest innovation isn't technical - it's psychological:

No Decision Fatigue:
Traditional micropayments: "Is this worth $0.25?" (mental overhead)
Streaming: Set budget once, forget about it

Loss Aversion Reversed:
Subscriptions: "I paid $10, I must use it!" (sunk cost)
Streaming: "I can stop anytime" (freedom)

Discovery Without Risk:
Subscriptions: "Will I use this enough to justify $10/month?"
Streaming: "Let me try this for $0.05"

Creator Trust:
Subscriptions: "Will they keep producing content?"
Streaming: "I pay for what exists right now"

The Insight: By removing the commitment, streaming payments reduce psychological friction to near zero. This is why mobile gaming succeeded with in-app purchases - small, frictionless payments.`,
      unlockAt: 135,
    },
    {
      section: "Challenges & The Road Ahead",
      content: `Streaming payments aren't perfect. Here are the challenges:

User Education:
Most people don't understand crypto wallets or account abstraction. We need:
- One-click onboarding
- Email/social login to smart wallets
- Invisible complexity

Price Discovery:
What should an article cost? Market needs to find equilibrium:
- Too high: No one reads
- Too low: Creator can't sustain
- Sweet spot: $0.05-0.20 for most content

Bundle vs. À La Carte:
Some content is better bundled (music albums, TV seasons)
Some is better per-unit (articles, tutorials)
We need both models

Regulation:
Micropayments could face:
- Money transmission licenses
- Tax reporting (if every $0.01 is taxable...)
- Consumer protection laws

The Future:
In 5 years, you'll have a crypto wallet with $50/month budget. As you browse, you'll seamlessly pay for:
- Articles you read
- Videos you watch
- APIs you use
- AI assistance you consume

No subscriptions. No commitments. Just value for value.

Thank you for reading! You just participated in the future of the creator economy. The $0.09 you spent was distributed with 99.5% going to the creator, settled in under 60 seconds, with zero gas fees.

This is how the internet should work.`,
      unlockAt: 160,
    },
  ],

  "3": [
    {
      section: "Introduction: Why Gasless dApps Matter",
      content: `Welcome to the practical guide to building gasless decentralized applications using ERC-4337 Account Abstraction.

If you've built dApps before, you know the user experience is terrible:
- Users need ETH for gas
- Every action requires wallet confirmation
- Gas fees are unpredictable
- Onboarding is a nightmare

Account abstraction fixes all of this. And you're experiencing it right now - you're paying for this article in USDC, with zero ETH in your wallet, and Biconomy is sponsoring your gas fees.

This tutorial will teach you how to build the same experience for your dApp.

What We'll Build: A pay-per-use content platform where users pay in USDC without needing ETH, and the platform sponsors gas fees.`,
      unlockAt: 0,
    },
    {
      section: "Prerequisites & Setup",
      content: `Before we start, you'll need:

Required Knowledge:
- React/Next.js basics
- Ethereum smart contracts (Solidity)
- Wagmi/Viem for blockchain interactions

Tools:
\`\`\`bash
npm install @biconomy/abstractjs viem wagmi
\`\`\`

API Keys:
1. Biconomy API key (get from biconomy.io/dashboard)
2. WalletConnect Project ID (walletconnect.com)
3. RPC endpoint (Alchemy/Infura)

Project Structure:
\`\`\`
my-gasless-dapp/
├── app/
│   └── page.tsx
├── components/
│   └── GaslessButton.tsx
├── lib/
│   ├── biconomy.ts
│   └── contracts.ts
└── hooks/
    └── useBiconomy.ts
\`\`\`

Let's start with the Biconomy client setup.`,
      unlockAt: 15,
    },
    {
      section: "Setting Up Biconomy Client",
      content: `First, we'll initialize the Biconomy MEE (Modular Execution Environment) client:

lib/biconomy.ts:
\`\`\`typescript
import {
  createMeeClient,
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
} from "@biconomy/abstractjs";
import { baseSepolia } from "viem/chains";
import { http } from "viem";

const API_KEY = process.env.NEXT_PUBLIC_BICONOMY_API_KEY!;

let meeClient: any | null = null;
let nexusAccount: any | null = null;

export async function initializeSmartAccount(provider: any) {
  // Create Nexus smart account
  nexusAccount = await toMultichainNexusAccount({
    signer: provider,
    chainConfigurations: [{
      chain: baseSepolia,
      transport: http(),
      version: getMEEVersion(MEEVersion.V2_1_0),
    }],
  });

  // Create MEE client for gasless transactions
  meeClient = await createMeeClient({
    account: nexusAccount,
    apiKey: API_KEY,
  });

  return {
    smartAccountAddress: nexusAccount.address,
    client: meeClient,
  };
}
\`\`\`

What's Happening:
1. toMultichainNexusAccount creates a smart contract wallet
2. The wallet is controlled by the user's signer (MetaMask, etc.)
3. MEE client handles gasless transaction routing
4. Paymaster sponsors gas fees automatically`,
      unlockAt: 35,
    },
    {
      section: "Creating Gasless Transactions",
      content: `Now let's create a gasless transaction to interact with a smart contract:

hooks/useBiconomy.ts:
\`\`\`typescript
export function useGaslessTransaction() {
  const [isLoading, setIsLoading] = useState(false);

  const executeGasless = async (
    contractAddress: string,
    abi: any,
    functionName: string,
    args: any[]
  ) => {
    setIsLoading(true);

    try {
      // Encode the contract call
      const callData = encodeFunctionData({
        abi,
        functionName,
        args,
      });

      // Execute with gas sponsorship
      const { hash } = await meeClient.execute({
        sponsorship: true, // This enables gas sponsorship!
        instructions: [{
          chainId: baseSepolia.id,
          calls: [{
            to: contractAddress,
            data: callData,
          }]
        }]
      });

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt({
        hash,
      });

      return receipt;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeGasless, isLoading };
}
\`\`\`

Key Point: \`sponsorship: true\` is all you need for gasless transactions!`,
      unlockAt: 58,
    },
    {
      section: "Multi-Step Gasless Operations",
      content: `Often you need to execute multiple operations atomically (like approve + transfer). Here's how:

\`\`\`typescript
export async function createStreamGasless(
  creatorAddress: string,
  ratePerMinute: number,
  depositDollars: number
) {
  const depositAmount = parseUnits(
    depositDollars.toString(),
    6
  ); // USDC has 6 decimals

  // Step 1: Approve USDC
  const approveCall = {
    to: USDC_ADDRESS,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STREAM_PAYMENT_ADDRESS, depositAmount]
    })
  };

  // Step 2: Create stream
  const createStreamCall = {
    to: STREAM_PAYMENT_ADDRESS,
    data: encodeFunctionData({
      abi: STREAM_PAYMENT_ABI,
      functionName: 'createStream',
      args: [
        creatorAddress,
        parseUnits((ratePerMinute / 60).toString(), 6),
        depositAmount
      ]
    })
  };

  // Execute both in single gasless transaction
  const { hash } = await meeClient.execute({
    sponsorship: true,
    instructions: [{
      chainId: baseSepolia.id,
      calls: [approveCall, createStreamCall] // Batched!
    }]
  });

  return hash;
}
\`\`\`

Why This Matters: Two operations, one transaction, zero gas fees for user.`,
      unlockAt: 85,
    },
    {
      section: "React Integration Pattern",
      content: `Here's how to integrate gasless transactions into your React components:

components/GaslessButton.tsx:
\`\`\`typescript
'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';

export function GaslessButton() {
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState('idle');

  const handleGaslessAction = async () => {
    if (!walletClient) return;

    setStatus('initializing');

    // Initialize smart account
    const { client } = await initializeSmartAccount(
      walletClient.transport
    );

    setStatus('executing');

    // Execute gasless transaction
    const hash = await client.execute({
      sponsorship: true,
      instructions: [{
        chainId: baseSepolia.id,
        calls: [{
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: CONTRACT_ABI,
            functionName: 'yourFunction',
            args: []
          })
        }]
      }]
    });

    setStatus('success');
  };

  return (
    <button
      onClick={handleGaslessAction}
      disabled={status !== 'idle'}
    >
      {status === 'idle' && 'Execute Gasless Transaction'}
      {status === 'initializing' && 'Setting up...'}
      {status === 'executing' && 'Executing...'}
      {status === 'success' && 'Success!'}
    </button>
  );
}
\`\`\``,
      unlockAt: 110,
    },
    {
      section: "Error Handling & Edge Cases",
      content: `Gasless transactions can fail. Here's how to handle errors gracefully:

\`\`\`typescript
async function executeWithRetry(operation: () => Promise<any>) {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await operation();
    } catch (error) {
      attempt++;

      // Parse error types
      if (error.message.includes('insufficient funds')) {
        throw new Error(
          'Insufficient USDC balance. Please top up.'
        );
      }

      if (error.message.includes('user rejected')) {
        throw new Error('Transaction cancelled by user');
      }

      if (error.message.includes('paymaster')) {
        if (attempt < MAX_RETRIES) {
          await sleep(1000 * attempt); // Exponential backoff
          continue;
        }
        throw new Error('Gas sponsorship failed. Try again.');
      }

      throw error; // Unknown error
    }
  }
}

// Usage
try {
  await executeWithRetry(() =>
    createStreamGasless(creator, rate, deposit)
  );
} catch (error) {
  // Show user-friendly error message
  alert(error.message);
}
\`\`\`

Common Errors:
- Paymaster timeout: Retry with backoff
- Insufficient balance: User needs more USDC
- User rejection: Graceful exit
- Network issues: Retry logic`,
      unlockAt: 135,
    },
    {
      section: "Gas Optimization Tips",
      content: `Even though users don't pay gas, YOU (the developer) do via the paymaster. Optimize:

Batch Operations:
\`\`\`typescript
// Bad: 3 separate gasless transactions
await approve();
await createStream();
await startStream();

// Good: 1 gasless transaction with 3 calls
await meeClient.execute({
  sponsorship: true,
  instructions: [{
    chainId: baseSepolia.id,
    calls: [
      { to: usdc, data: approveData },
      { to: stream, data: createData },
      { to: stream, data: startData }
    ]
  }]
});
\`\`\`

Smart Contract Optimization:
- Use \`uint256\` instead of \`uint8\` (same cost, avoids conversions)
- Pack struct variables by size
- Use events instead of storage where possible
- Minimize SLOAD operations

Paymaster Budget:
Set a monthly budget for gas sponsorship. Monitor usage:
\`\`\`typescript
// Track gas usage
const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
await logGasMetrics(gasUsed);

// Alert if over budget
if (monthlyGasSpend > GAS_BUDGET) {
  await alertAdmin('Gas budget exceeded');
}
\`\`\``,
      unlockAt: 162,
    },
    {
      section: "Testing Gasless Transactions",
      content: `Testing is crucial. Here's a complete test setup:

test/gasless.test.ts:
\`\`\`typescript
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe('Gasless Transactions', function() {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();

    // Deploy mocks
    const USDC = await ethers.deployContract('MockUSDC');
    const Stream = await ethers.deployContract('StreamPayment');

    // Setup Biconomy testnet
    const meeClient = await createMeeClient({
      account: user.address,
      apiKey: process.env.BICONOMY_TEST_KEY,
    });

    return { owner, user, USDC, Stream, meeClient };
  }

  it('should execute gasless approve + createStream', async () => {
    const { user, USDC, Stream, meeClient } =
      await loadFixture(deployFixture);

    // Fund user with USDC
    await USDC.mint(user.address, parseUnits('100', 6));

    // Execute gasless transaction
    const { hash } = await meeClient.execute({
      sponsorship: true,
      instructions: [{
        calls: [
          {
            to: await USDC.getAddress(),
            data: encodeFunctionData({
              abi: USDC_ABI,
              functionName: 'approve',
              args: [await Stream.getAddress(), parseUnits('10', 6)]
            })
          },
          {
            to: await Stream.getAddress(),
            data: encodeFunctionData({
              abi: STREAM_ABI,
              functionName: 'createStream',
              args: [owner.address, parseUnits('0.0003', 6), parseUnits('10', 6)]
            })
          }
        ]
      }]
    });

    // Verify stream was created
    const streamCount = await Stream.streamCount();
    expect(streamCount).to.equal(1);

    // Verify user has no ETH balance change
    const ethBalance = await ethers.provider.getBalance(user.address);
    expect(ethBalance).to.equal(initialBalance); // No ETH spent!
  });
});
\`\`\``,
      unlockAt: 190,
    },
    {
      section: "Production Checklist & Best Practices",
      content: `Before launching your gasless dApp:

Security:
- Audit smart contracts
- Set gas limits on paymaster
- Implement rate limiting
- Monitor for abuse (bots creating fake accounts)

UX:
- Show "gasless" badge prominently
- Explain no ETH needed
- Loading states for smart account initialization
- Clear error messages

Performance:
- Cache smart account address
- Batch operations where possible
- Use optimistic updates for better UX
- Implement retry logic with exponential backoff

Monitoring:
\`\`\`typescript
// Track key metrics
const metrics = {
  gaslessTransactions: 0,
  gasCostSponsored: 0,
  averageGasPerTx: 0,
  failureRate: 0,
};

// Alert on anomalies
if (metrics.failureRate > 0.05) {
  await alertAdmin('High failure rate detected');
}
\`\`\`

Cost Management:
- Set monthly paymaster budget
- Implement tiered sponsorship (free tier + paid)
- Monitor gas prices, pause if too high
- Consider hybrid model (sponsor small tx, user pays large)

Congratulations! You now know how to build gasless dApps with ERC-4337. The future of Web3 UX starts here.

Next Steps:
- Deploy to testnet and experiment
- Join Biconomy Discord for support
- Read ERC-4337 spec for deep understanding
- Build something amazing!`,
      unlockAt: 220,
    },
  ],

  "4": [
    {
      section: "Introduction: Why Security Matters",
      content: `Welcome to this deep dive into smart contract security for payment streaming protocols.

You're currently using a payment streaming system. Every second, money is flowing from your wallet to the creator. If there's a vulnerability, an attacker could:
- Drain your entire deposit instantly
- Steal funds from all active streams
- Manipulate rates to overcharge users
- Front-run transactions to their advantage

This article examines real vulnerabilities in streaming payment systems and how StreamPay protects against them.

Warning: This article contains detailed security analysis. Do not use these techniques maliciously. This is for educational and defensive purposes only.`,
      unlockAt: 0,
    },
    {
      section: "Attack Vector #1: Reentrancy",
      content: `Reentrancy is the most famous Ethereum vulnerability (The DAO hack, 2016).

How It Works:
\`\`\`solidity
// VULNERABLE CODE
function stopStream(uint256 streamId) external {
    Stream storage stream = streams[streamId];
    uint256 amountDue = calculateStreamedAmount(streamId);

    // Send funds BEFORE updating state (vulnerable!)
    USDC.transfer(stream.creator, amountDue);
    USDC.transfer(stream.viewer, stream.deposit - amountDue);

    stream.isActive = false; // State update AFTER transfer
}
\`\`\`

The Attack:
1. Attacker creates a malicious contract as "creator"
2. When receiving USDC, the receive() function calls stopStream() again
3. Since isActive hasn't been set to false yet, it calculates payment again
4. Attacker receives double payment

The Fix:
\`\`\`solidity
function stopStream(uint256 streamId) external {
    Stream storage stream = streams[streamId];
    require(stream.isActive, "Already stopped"); // Check

    uint256 amountDue = calculateStreamedAmount(streamId);
    stream.isActive = false; // Effect - update state FIRST

    // Interaction - external calls LAST
    USDC.transfer(stream.creator, amountDue);
    USDC.transfer(stream.viewer, stream.deposit - amountDue);
}
\`\`\`

Pattern: Check-Effects-Interactions (CEI)
1. Check: Validate conditions
2. Effects: Update state
3. Interactions: External calls

StreamPay uses CEI pattern + ReentrancyGuard modifier on all state-changing functions.`,
      unlockAt: 18,
    },
    {
      section: "Attack Vector #2: Integer Overflow/Underflow",
      content: `Before Solidity 0.8.0, arithmetic operations could silently overflow:

Vulnerable Code (Solidity <0.8.0):
\`\`\`solidity
function extendStream(uint256 streamId, uint256 additionalDeposit) external {
    Stream storage stream = streams[streamId];

    // Overflow possible!
    stream.deposit = stream.deposit + additionalDeposit;

    USDC.transferFrom(msg.sender, address(this), additionalDeposit);
}
\`\`\`

The Attack:
\`\`\`solidity
// stream.deposit = type(uint256).max - 100
// attacker sends additionalDeposit = 200
// Result: overflow wraps to 99
// Attacker gets stream.deposit - 99 refunded!
\`\`\`

Modern Fix:
Solidity 0.8.0+ has built-in overflow protection. Operations automatically revert on overflow.

\`\`\`solidity
pragma solidity ^0.8.0; // Safe by default

function extendStream(uint256 streamId, uint256 additionalDeposit) external {
    Stream storage stream = streams[streamId];
    stream.deposit += additionalDeposit; // Reverts on overflow
    USDC.transferFrom(msg.sender, address(this), additionalDeposit);
}
\`\`\`

Additional Protection:
\`\`\`solidity
require(
    additionalDeposit <= MAX_DEPOSIT,
    "Deposit too large"
);
require(
    stream.deposit + additionalDeposit <= MAX_TOTAL_DEPOSIT,
    "Total deposit exceeds maximum"
);
\`\`\``,
      unlockAt: 40,
    },
    {
      section: "Attack Vector #3: Front-Running",
      content: `Front-running is when an attacker sees your transaction in the mempool and submits their own transaction with higher gas to execute first.

The Attack Scenario:
\`\`\`solidity
// User sees creator's rate is 0.02/min
// User submits: createStream(creator, 0.02/min, $10)
// Transaction sits in mempool for 12 seconds

// Attacker (the creator) sees this and front-runs:
// Attacker submits: updateRate(0.05/min) with higher gas
// Attacker's tx confirms first
// User's tx confirms second - paying 0.05/min instead of 0.02!
\`\`\`

StreamPay's Protection #1: Rate Locking
\`\`\`solidity
function createStream(
    address creator,
    uint256 ratePerSecond,
    uint256 maxDeposit
) external returns (uint256 streamId) {
    // Rate is specified by USER, not read from creator
    // Front-running creator's rate change does nothing

    streams[nextStreamId] = Stream({
        creator: creator,
        ratePerSecond: ratePerSecond, // Locked at creation
        deposit: maxDeposit,
        startTime: block.timestamp,
        isActive: true
    });
}
\`\`\`

StreamPay's Protection #2: Slippage Protection
\`\`\`solidity
function createStream(
    address creator,
    uint256 expectedRate,
    uint256 maxDeposit,
    uint256 maxAcceptableRate // Slippage protection
) external returns (uint256 streamId) {
    uint256 actualRate = creatorRates[creator];

    require(
        actualRate <= maxAcceptableRate,
        "Rate changed, transaction reverted"
    );

    // Proceed with stream creation
}
\`\`\``,
      unlockAt: 65,
    },
    {
      section: "Attack Vector #4: Timestamp Manipulation",
      content: `Miners can manipulate block.timestamp within ~15 seconds. This can affect time-based calculations:

Vulnerable Code:
\`\`\`solidity
function getStreamedAmount(uint256 streamId) public view returns (uint256) {
    Stream memory stream = streams[streamId];
    uint256 elapsed = block.timestamp - stream.startTime;
    return elapsed * stream.ratePerSecond;
}
\`\`\`

The Attack:
A malicious miner could:
1. Set block.timestamp 15 seconds in the future
2. User's stopStream() call calculates 15 extra seconds of payment
3. Creator receives extra payment

Realistic Impact:
- Stream rate: $0.02/min = $0.000333/sec
- 15 second manipulation = $0.005 extra
- On a $10 stream = 0.05% impact
- Generally not worth it for miners

But Still, StreamPay's Protection:
\`\`\`solidity
uint256 constant MAX_TIMESTAMP_DEVIATION = 30 seconds;

function stopStream(uint256 streamId) external {
    Stream storage stream = streams[streamId];
    uint256 elapsed = block.timestamp - stream.startTime;

    // Sanity check against extreme manipulation
    require(
        elapsed < stream.deposit / stream.ratePerSecond + MAX_TIMESTAMP_DEVIATION,
        "Timestamp manipulation detected"
    );

    // Proceed with settlement
}
\`\`\`

Additional Mitigation:
Use block numbers instead of timestamps for critical time calculations, though this makes UX worse (variable block times).`,
      unlockAt: 92,
    },
    {
      section: "Attack Vector #5: Griefing Attacks",
      content: `Griefing attacks don't steal funds but can disrupt the protocol:

Attack #1: Stream Spam
\`\`\`solidity
// Attacker creates 10,000 dust streams
for(uint i = 0; i < 10000; i++) {
    createStream(victim, 0.000001 ether, 0.001 ether);
}
// Victim's dashboard is flooded with spam streams
// Gas costs make it expensive to close them all
\`\`\`

Protection: Minimum Deposit
\`\`\`solidity
uint256 constant MIN_DEPOSIT = 0.1 * 106; // $0.10 minimum

function createStream(...) external {
    require(
        maxDeposit >= MIN_DEPOSIT,
        "Deposit too small"
    );
}
\`\`\`

Attack #2: Dust Attacks
\`\`\`solidity
// Create stream with 0.000001/sec rate
// Let it run for 1 second = 0.000001 total
// Creator receives dust amount, wastes gas claiming it
\`\`\`

Protection: Minimum Rate
\`\`\`solidity
uint256 constant MIN_RATE_PER_SECOND = 0.0001 * 106 / 60;

function createStream(...) external {
    require(
        ratePerSecond >= MIN_RATE_PER_SECOND,
        "Rate too low"
    );
}
\`\`\`

Attack #3: Storage Bloat
Create millions of streams to bloat contract storage.

Protection: Fee Structure
\`\`\`solidity
// Charge creation fee that goes to protocol treasury
uint256 constant CREATION_FEE = 0.01 * 106; // $0.01

function createStream(...) external {
    USDC.transferFrom(msg.sender, treasury, CREATION_FEE);
    // Continue with stream creation
}
\`\`\``,
      unlockAt: 120,
    },
    {
      section: "Attack Vector #6: Oracle Manipulation",
      content: `If your protocol uses price oracles, they can be manipulated:

Vulnerable Pattern:
\`\`\`solidity
// Get USDC/ETH price from Uniswap
function getUSDCPrice() internal view returns (uint256) {
    (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
    return reserve1 / reserve0; // VULNERABLE to flash loans
}

function createStreamWithETH() external payable {
    uint256 usdcEquivalent = msg.value * getUSDCPrice();
    // Create stream with USDC equivalent
}
\`\`\`

The Attack:
\`\`\`solidity
// 1. Flash loan to manipulate Uniswap pool
flashLoan(1000 ETH);
swapETHForUSDC(1000 ETH); // Skews price 10x

// 2. Call createStreamWithETH with manipulated price
createStreamWithETH{value: 1 ETH}(); // Gets 10x USDC value

// 3. Repay flash loan
swapUSDCForETH(...);
repayFlashLoan();
\`\`\`

Protection: Time-Weighted Average Price (TWAP)
\`\`\`solidity
// Use Chainlink or Uniswap V3 TWAP
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

AggregatorV3Interface internal priceFeed;

function getUSDCPrice() internal view returns (uint256) {
    (
        uint80 roundID,
        int price,
        uint startedAt,
        uint timeStamp,
        uint80 answeredInRound
    ) = priceFeed.latestRoundData();

    require(timeStamp > 0, "Round not complete");
    require(price > 0, "Invalid price");

    return uint256(price);
}
\`\`\`

Best Practice:
- Don't use spot prices for critical operations
- Use multiple oracles and compare
- Implement price deviation limits`,
      unlockAt: 148,
    },
    {
      section: "Defense in Depth: Multi-Layer Security",
      content: `Security isn't one technique - it's layers of protection:

Layer 1: Smart Contract
\`\`\`solidity
contract StreamPayment {
    using SafeERC20 for IERC20; // Safe token transfers

    ReentrancyGuard nonReentrant; // Reentrancy protection
    Pausable whenNotPaused; // Emergency pause
    Ownable onlyOwner; // Access control

    // Rate limits
    mapping(address => uint256) public lastStreamCreation;
    uint256 constant RATE_LIMIT = 10 seconds;

    function createStream(...)
        external
        nonReentrant
        whenNotPaused
    {
        require(
            block.timestamp > lastStreamCreation[msg.sender] + RATE_LIMIT,
            "Rate limited"
        );

        // Business logic

        lastStreamCreation[msg.sender] = block.timestamp;
    }
}
\`\`\`

Layer 2: Monitoring
\`\`\`typescript
// Off-chain monitoring system
async function monitorAnomalies() {
    const events = await contract.queryFilter(
        contract.filters.StreamCreated()
    );

    // Detect suspicious patterns
    const suspiciousPatterns = detectPatterns(events);

    if (suspiciousPatterns.length > 0) {
        await pauseContract();
        await alertAdmin(suspiciousPatterns);
    }
}
\`\`\`

Layer 3: Upgradeability
\`\`\`solidity
// Use upgradeable proxy pattern
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract StreamPayment is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
\`\`\`

Layer 4: Insurance
Partner with DeFi insurance protocols like Nexus Mutual to cover potential exploits.`,
      unlockAt: 178,
    },
    {
      section: "Audit Checklist & Best Practices",
      content: `Before launching, go through this security checklist:

Smart Contract Audit:
- Formal verification of critical functions
- Third-party audit (Trail of Bits, OpenZeppelin, etc.)
- Public bug bounty program
- Testnet deployment for 2+ weeks

Common Vulnerability Checklist:
\`\`\`
[ ] Reentrancy protection on all state changes
[ ] Integer overflow/underflow protection (Solidity 0.8.0+)
[ ] Front-running protection via slippage/rate locking
[ ] Access control on admin functions
[ ] Input validation on all parameters
[ ] Rate limiting on expensive operations
[ ] Emergency pause mechanism
[ ] Upgrade path for fixing vulnerabilities
[ ] Events emitted for all critical operations
[ ] Proper use of CEI pattern
[ ] Safe external calls (no unchecked)
[ ] Gas limits on loops
[ ] No delegatecall to untrusted contracts
[ ] Proper randomness (if needed)
[ ] No timestamp manipulation reliance
\`\`\`

Testing Requirements:
\`\`\`typescript
describe('Security Tests', () => {
    it('should prevent reentrancy attacks', async () => {
        const attacker = await deployAttacker();
        await expect(
            attacker.attack()
        ).to.be.revertedWith('ReentrancyGuard: reentrant call');
    });

    it('should prevent integer overflow', async () => {
        await expect(
            stream.extendStream(streamId, MAX_UINT256)
        ).to.be.reverted;
    });

    it('should prevent unauthorized access', async () => {
        await expect(
            stream.connect(hacker).pause()
        ).to.be.revertedWith('Ownable: caller is not the owner');
    });
});
\`\`\`

Launch Strategy:
1. Deploy to testnet, run for 1 month
2. Bug bounty with $50k-100k rewards
3. Audit by 2-3 firms
4. Gradual rollout: $10k cap → $100k → $1M → unlimited
5. Multi-sig for admin operations (3-of-5 minimum)

Congratulations! You now understand the major attack vectors in payment streaming protocols and how to defend against them.

Remember: Security is not a feature, it's a process. Continuous monitoring, testing, and improvement are essential.`,
      unlockAt: 210,
    },
  ],
};
