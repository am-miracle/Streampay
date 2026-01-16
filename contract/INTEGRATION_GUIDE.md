# StreamPay Integration Guide

## 🎯 Creator Analytics + Gasless Transactions

This guide covers how to display creator analytics and implement gasless transactions using Biconomy.

---

## 📊 Analytics Architecture

### Overview

```
Smart Contract (On-Chain)          The Graph (Off-Chain)              Frontend
─────────────────────────          ─────────────────────              ────────
• Emit rich events                 • Index all events                 • Query GraphQL
• Store lightweight stats          • Calculate aggregates             • Display analytics
• totalEarned tracking            • Store full history               • Real-time updates
• activeStreamCount               • Fast queries                     • Creator dashboard

         │                                │                                   │
         ├──── Events ──────────────────►│                                   │
         │                                │                                   │
         │                                ├──── GraphQL ────────────────────►│
         │                                │                                   │
         ├──── View Functions ────────────────────────────────────────────►│
```

### What We Store Where

| Data | On-Chain | The Graph | Frontend |
|------|----------|-----------|----------|
| Total Earned (all time) | ✅ | ✅ | Read from both |
| Pending Earnings | ✅ | ❌ | Read from chain |
| Active Stream Count | ✅ | ✅ | Read from both |
| Active Streams Table | ❌ | ✅ | Query subgraph |
| Stream History | ❌ | ✅ | Query subgraph |
| Average per Stream | ❌ | ✅ | Calculated in query |
| Total Viewers | ❌ | ✅ | Count unique payers |

---

## 🔧 Implementation

### 1️⃣ Smart Contract (✅ Already Implemented)

The contract now emits enhanced events and tracks:

```solidity
// Events emitted:
event StreamCreated(
    uint256 indexed streamId,
    address indexed payer,
    address indexed receiver,
    uint256 ratePerSecond,
    uint256 maxDeposit,
    uint256 startTime  // ← NEW: For analytics
);

event StreamStopped(
    uint256 indexed streamId,
    uint256 totalPaid,
    uint256 refunded,
    uint256 duration  // ← For analytics
);

// View functions:
getCreatorTotalEarned(address) → Total earned all time
getCreatorActiveStreamCount(address) → Current active streams
getCreatorEarnings(address) → Pending withdrawable balance
```

### 2️⃣ The Graph Subgraph (Recommended)

Create a subgraph to index all events and provide GraphQL API.

#### **schema.graphql**

```graphql
type Creator @entity {
  id: ID!                          # Creator address
  totalEarned: BigInt!             # Sum of all earnings
  totalWithdrawn: BigInt!          # Sum of withdrawals
  activeStreamCount: Int!          # Current active streams
  totalStreamCount: Int!           # All-time stream count
  totalViewers: Int!               # Unique payers count
  streams: [Stream!]! @derivedFrom(field: "receiver")
  uniquePayers: [Bytes!]!          # Array of unique payer addresses
}

type Stream @entity {
  id: ID!                          # streamId
  payer: Bytes!                    # Viewer address
  receiver: Creator!               # Creator entity
  ratePerSecond: BigInt!           # Payment rate
  deposit: BigInt!                 # Initial deposit
  startTime: BigInt!               # Start timestamp
  endTime: BigInt                  # Stop timestamp (null if active)
  duration: BigInt                 # Seconds streamed
  totalPaid: BigInt                # Amount paid to creator
  refunded: BigInt                 # Amount refunded to payer
  isActive: Boolean!               # Current status
}

type StreamStoppedEvent @entity {
  id: ID!                          # txHash-logIndex
  streamId: BigInt!
  timestamp: BigInt!
  totalPaid: BigInt!
  duration: BigInt!
}
```

#### **subgraph.yaml**

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: StreamPayment
    network: polygon-amoy
    source:
      address: "YOUR_CONTRACT_ADDRESS"
      abi: StreamPayment
      startBlock: START_BLOCK_NUMBER
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Stream
        - Creator
      abis:
        - name: StreamPayment
          file: ./abis/StreamPayment.json
      eventHandlers:
        - event: StreamCreated(uint256,address,address,uint256,uint256,uint256)
          handler: handleStreamCreated
        - event: StreamStopped(uint256,uint256,uint256,uint256)
          handler: handleStreamStopped
        - event: EarningsWithdrawn(address,uint256)
          handler: handleEarningsWithdrawn
      file: ./src/mapping.ts
```

#### **src/mapping.ts**

```typescript
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  StreamCreated,
  StreamStopped,
  EarningsWithdrawn
} from "../generated/StreamPayment/StreamPayment"
import { Stream, Creator } from "../generated/schema"

export function handleStreamCreated(event: StreamCreated): void {
  // Load or create Creator
  let creator = Creator.load(event.params.receiver.toHex())
  if (creator == null) {
    creator = new Creator(event.params.receiver.toHex())
    creator.totalEarned = BigInt.fromI32(0)
    creator.totalWithdrawn = BigInt.fromI32(0)
    creator.activeStreamCount = 0
    creator.totalStreamCount = 0
    creator.totalViewers = 0
    creator.uniquePayers = []
  }

  // Track unique viewers
  let payers = creator.uniquePayers
  if (!payers.includes(event.params.payer)) {
    payers.push(event.params.payer)
    creator.uniquePayers = payers
    creator.totalViewers = payers.length
  }

  creator.activeStreamCount += 1
  creator.totalStreamCount += 1
  creator.save()

  // Create Stream entity
  let stream = new Stream(event.params.streamId.toString())
  stream.payer = event.params.payer
  stream.receiver = event.params.receiver.toHex()
  stream.ratePerSecond = event.params.ratePerSecond
  stream.deposit = event.params.maxDeposit
  stream.startTime = event.params.startTime
  stream.isActive = true
  stream.save()
}

export function handleStreamStopped(event: StreamStopped): void {
  let stream = Stream.load(event.params.streamId.toString())
  if (stream == null) return

  stream.endTime = event.block.timestamp
  stream.duration = event.params.duration
  stream.totalPaid = event.params.totalPaid
  stream.refunded = event.params.refunded
  stream.isActive = false
  stream.save()

  // Update creator stats
  let creator = Creator.load(stream.receiver)
  if (creator != null) {
    creator.activeStreamCount -= 1
    creator.totalEarned = creator.totalEarned.plus(event.params.totalPaid)
    creator.save()
  }
}

export function handleEarningsWithdrawn(event: EarningsWithdrawn): void {
  let creator = Creator.load(event.params.creator.toHex())
  if (creator != null) {
    creator.totalWithdrawn = creator.totalWithdrawn.plus(event.params.amount)
    creator.save()
  }
}
```

### 3️⃣ Frontend GraphQL Queries

#### **Get Creator Dashboard Stats**

```graphql
query GetCreatorStats($creatorAddress: ID!) {
  creator(id: $creatorAddress) {
    totalEarned
    totalWithdrawn
    activeStreamCount
    totalStreamCount
    totalViewers
  }
}
```

#### **Get Active Streams Table**

```graphql
query GetActiveStreams($creatorAddress: String!) {
  streams(
    where: { receiver: $creatorAddress, isActive: true }
    orderBy: startTime
    orderDirection: desc
  ) {
    id
    payer
    ratePerSecond
    deposit
    startTime
    duration
    totalPaid
  }
}
```

#### **Get Recent History**

```graphql
query GetStreamHistory($creatorAddress: String!, $first: Int!) {
  streams(
    where: { receiver: $creatorAddress, isActive: false }
    orderBy: endTime
    orderDirection: desc
    first: $first
  ) {
    id
    payer
    duration
    totalPaid
    endTime
  }
}
```

#### **Get Average Earnings Per Stream**

```graphql
query GetCreatorAnalytics($creatorAddress: ID!) {
  creator(id: $creatorAddress) {
    totalEarned
    totalStreamCount
    streams(where: { isActive: false }) {
      totalPaid
    }
  }
}

# Calculate average in frontend:
# avgPerStream = totalEarned / totalStreamCount
```

---

## ⛽ Gasless Transactions with Biconomy v4

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User (EOA Wallet)                    │
│              MetaMask / WalletConnect                   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Sign UserOperation
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Biconomy Smart Account (ERC-4337)          │
│  • User owns account via EOA                            │
│  • Account calls StreamPayment contract                │
│  • No gas needed from user                              │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Send UserOp
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Biconomy Bundler                       │
│  • Receives UserOperations                              │
│  • Bundles multiple ops                                 │
│  • Sends to EntryPoint                                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Validate & Sponsor
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Biconomy Paymaster                     │
│  • Pays gas fees for user                               │
│  • You fund this account                                │
│  • Validates allowed operations                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Execute on-chain
                           ▼
┌─────────────────────────────────────────────────────────┐
│              StreamPayment Smart Contract               │
│  • Receives call from Smart Account                     │
│  • Executes createStream() or stopStream()              │
│  • User pays ZERO gas                                   │
└─────────────────────────────────────────────────────────┘
```

### Setup Steps

#### **1. Install Dependencies**

```bash
npm install @biconomy/account @biconomy/bundler @biconomy/paymaster @biconomy/core-types
npm install viem ethers@6
```

#### **2. Get Biconomy API Keys**

1. Go to https://dashboard.biconomy.io/
2. Create a new project
3. Select "Polygon Amoy Testnet"
4. Get your:
   - Bundler URL
   - Paymaster URL
   - API Key

#### **3. Fund Your Paymaster**

1. In Biconomy dashboard, go to "Gas Tank"
2. Deposit MATIC on Polygon Amoy
3. This pays for user gas fees

---

### Implementation Code

#### **biconomy-config.ts**

```typescript
import { createSmartAccountClient } from "@biconomy/account"
import { createWalletClient, createPublicClient, custom, http } from "viem"
import { polygonAmoy } from "viem/chains"

// Biconomy configuration
const BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL!
const PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL!

export async function createBiconomySmartAccount(
  provider: any // window.ethereum or wallet provider
) {
  // Create viem wallet client from user's EOA
  const walletClient = createWalletClient({
    chain: polygonAmoy,
    transport: custom(provider),
  })

  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  })

  const [address] = await walletClient.getAddresses()

  // Create Biconomy Smart Account
  const smartAccount = await createSmartAccountClient({
    signer: walletClient,
    bundlerUrl: BUNDLER_URL,
    biconomyPaymasterApiKey: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY!,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
  })

  return {
    smartAccount,
    smartAccountAddress: await smartAccount.getAccountAddress(),
    eoaAddress: address,
  }
}
```

#### **useGaslessStream.ts** (React Hook)

```typescript
import { useState } from 'react'
import { encodeFunctionData, parseUnits } from 'viem'
import { createBiconomySmartAccount } from './biconomy-config'

const STREAM_PAYMENT_ADDRESS = process.env.NEXT_PUBLIC_STREAM_CONTRACT!
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT!

// ABI snippets
const STREAM_PAYMENT_ABI = [
  {
    name: 'createStream',
    type: 'function',
    inputs: [
      { name: 'receiver', type: 'address' },
      { name: 'ratePerSecond', type: 'uint256' },
      { name: 'maxDeposit', type: 'uint256' },
    ],
    outputs: [{ name: 'streamId', type: 'uint256' }],
  },
  {
    name: 'stopStream',
    type: 'function',
    inputs: [{ name: 'streamId', type: 'uint256' }],
  },
]

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
]

export function useGaslessStream() {
  const [loading, setLoading] = useState(false)

  async function createStreamGasless(
    provider: any,
    creatorAddress: string,
    ratePerMinute: number, // e.g., 0.02 (dollars)
    depositAmount: number // e.g., 1.00 (dollars)
  ) {
    try {
      setLoading(true)

      // 1. Create Biconomy Smart Account
      const { smartAccount, smartAccountAddress } = 
        await createBiconomySmartAccount(provider)

      // 2. Convert rates to wei (USDC has 6 decimals)
      const ratePerSecond = Math.floor((ratePerMinute / 60) * 1e6)
      const depositWei = parseUnits(depositAmount.toString(), 6)

      // 3. Build batch transaction: approve + createStream
      const transactions = [
        {
          to: USDC_ADDRESS,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [STREAM_PAYMENT_ADDRESS, depositWei],
          }),
        },
        {
          to: STREAM_PAYMENT_ADDRESS,
          data: encodeFunctionData({
            abi: STREAM_PAYMENT_ABI,
            functionName: 'createStream',
            args: [creatorAddress, ratePerSecond, depositWei],
          }),
        },
      ]

      // 4. Send gasless transaction via Biconomy
      const userOpResponse = await smartAccount.sendTransaction(transactions)
      
      // 5. Wait for confirmation
      const receipt = await userOpResponse.wait()

      console.log('Stream created! User paid ZERO gas ✅')
      console.log('UserOp Hash:', receipt.userOpHash)
      console.log('Tx Hash:', receipt.transactionHash)

      return receipt

    } catch (error) {
      console.error('Gasless stream creation failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function stopStreamGasless(provider: any, streamId: number) {
    try {
      setLoading(true)

      const { smartAccount } = await createBiconomySmartAccount(provider)

      const userOpResponse = await smartAccount.sendTransaction({
        to: STREAM_PAYMENT_ADDRESS,
        data: encodeFunctionData({
          abi: STREAM_PAYMENT_ABI,
          functionName: 'stopStream',
          args: [streamId],
        }),
      })

      const receipt = await userOpResponse.wait()
      console.log('Stream stopped! User paid ZERO gas ✅')
      
      return receipt

    } catch (error) {
      console.error('Gasless stream stop failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    createStreamGasless,
    stopStreamGasless,
    loading,
  }
}
```

#### **CreatorDashboard.tsx** (Example Component)

```typescript
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import { usePublicClient } from 'wagmi'

const GET_CREATOR_ANALYTICS = gql`
  query GetCreatorAnalytics($creatorAddress: ID!) {
    creator(id: $creatorAddress) {
      totalEarned
      totalWithdrawn
      activeStreamCount
      totalStreamCount
      totalViewers
    }
    activeStreams: streams(
      where: { receiver: $creatorAddress, isActive: true }
      orderBy: startTime
      orderDirection: desc
    ) {
      id
      payer
      ratePerSecond
      startTime
    }
    recentHistory: streams(
      where: { receiver: $creatorAddress, isActive: false }
      orderBy: endTime
      orderDirection: desc
      first: 10
    ) {
      id
      payer
      duration
      totalPaid
      endTime
    }
  }
`

export function CreatorDashboard({ creatorAddress }: { creatorAddress: string }) {
  const { data, loading } = useQuery(GET_CREATOR_ANALYTICS, {
    variables: { creatorAddress: creatorAddress.toLowerCase() },
    pollInterval: 10000, // Refresh every 10s
  })

  if (loading) return <div>Loading analytics...</div>

  const creator = data?.creator
  const activeStreams = data?.activeStreams || []
  const history = data?.recentHistory || []

  // Calculate average earnings per stream
  const avgPerStream = creator?.totalStreamCount > 0
    ? Number(formatUnits(creator.totalEarned, 6)) / creator.totalStreamCount
    : 0

  return (
    <div className="creator-dashboard">
      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          label="Total Earned"
          value={`$${formatUnits(creator?.totalEarned || 0, 6)}`}
        />
        <StatCard
          label="Active Streams"
          value={creator?.activeStreamCount || 0}
        />
        <StatCard
          label="Total Viewers"
          value={creator?.totalViewers || 0}
        />
        <StatCard
          label="Avg per Stream"
          value={`$${avgPerStream.toFixed(4)}`}
        />
      </div>

      {/* Active Streams Table */}
      <section>
        <h2>Active Streams</h2>
        <table>
          <thead>
            <tr>
              <th>Viewer</th>
              <th>Duration</th>
              <th>Rate/min</th>
              <th>Earned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeStreams.map((stream: any) => {
              const elapsed = Math.floor(Date.now() / 1000) - stream.startTime
              const ratePerMin = Number(formatUnits(stream.ratePerSecond * 60, 6))
              const currentEarned = elapsed * Number(formatUnits(stream.ratePerSecond, 6))

              return (
                <tr key={stream.id}>
                  <td>{stream.payer.slice(0, 6)}...{stream.payer.slice(-4)}</td>
                  <td>{formatDuration(elapsed)}</td>
                  <td>${ratePerMin.toFixed(4)}/min</td>
                  <td>${currentEarned.toFixed(4)}</td>
                  <td><span className="badge-active">Active</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* Recent History */}
      <section>
        <h2>Recent History</h2>
        <table>
          <thead>
            <tr>
              <th>Viewer</th>
              <th>Duration</th>
              <th>Earned</th>
              <th>Ended</th>
            </tr>
          </thead>
          <tbody>
            {history.map((stream: any) => (
              <tr key={stream.id}>
                <td>{stream.payer.slice(0, 6)}...{stream.payer.slice(-4)}</td>
                <td>{formatDuration(stream.duration)}</td>
                <td>${formatUnits(stream.totalPaid, 6)}</td>
                <td>{formatRelativeTime(stream.endTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
```

---

## 🚀 Deployment Checklist

### 1. Deploy Smart Contract
```bash
cd contract
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### 2. Deploy Subgraph
```bash
# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Initialize subgraph
graph init --studio streampay

# Update subgraph.yaml with contract address
# Deploy to The Graph Studio (free hosted service)
graph auth --studio <DEPLOY_KEY>
graph codegen && graph build
graph deploy --studio streampay
```

### 3. Configure Biconomy
- Create account at https://dashboard.biconomy.io
- Fund gas tank with MATIC
- Copy API keys to `.env`

### 4. Frontend Environment Variables
```bash
NEXT_PUBLIC_STREAM_CONTRACT=0x...
NEXT_PUBLIC_USDC_CONTRACT=0x...
NEXT_PUBLIC_BICONOMY_BUNDLER_URL=https://bundler.biconomy.io/api/v2/80002/...
NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY=...
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/.../streampay/v0.0.1
```

---

## 💡 Key Benefits

### For Users:
- **Zero gas fees** - Paymaster sponsors all transactions
- **One-click experience** - No complex wallet setup
- **Instant start** - Approve USDC once, stream forever

### For Creators:
- **Real-time analytics** - See earnings update live
- **Historical data** - Track all past streams
- **Viewer insights** - Unique viewer count, avg earnings

### For You (Platform):
- **Scalable** - Subgraph handles any data volume
- **Cost-efficient** - Pay gas only for active users
- **Professional** - Industry-standard tooling (Biconomy + The Graph)

---

## 📚 Additional Resources

- **Biconomy Docs**: https://docs.biconomy.io/
- **The Graph Docs**: https://thegraph.com/docs/
- **Polygon Amoy Faucet**: https://faucet.polygon.technology/
- **Test USDC**: Mint from Polygon Amoy USDC contract

