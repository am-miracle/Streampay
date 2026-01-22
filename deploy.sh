#!/bin/bash

# StreamPay Full Deployment Script
# Deploys contract to Base Sepolia, updates frontend and subgraph configs

set -e  # Exit on any error

echo "🚀 StreamPay Deployment to Base Sepolia"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build and deploy contract
echo -e "${BLUE}Step 1: Building and deploying StreamPayment contract...${NC}"
cd contract

# Build the contract
echo "Building contract..."
forge build

# Deploy to Base Sepolia (chain ID 84532)
echo "Deploying to Base Sepolia..."
forge script script/Deploy.s.sol:DeployStreamPayment \
  --rpc-url base_sepolia \
  --broadcast \
  --verify \
  -vvvv

# Get the deployed contract address from the latest broadcast
echo ""
echo "Extracting deployment info..."
CONTRACT_ADDRESS=$(cat broadcast/Deploy.s.sol/84532/run-latest.json | jq -r '.transactions[0].contractAddress')
BLOCK_NUMBER=$(cat broadcast/Deploy.s.sol/84532/run-latest.json | jq -r '.receipts[0].blockNumber')
BLOCK_NUMBER_DEC=$((BLOCK_NUMBER))

echo -e "${GREEN}✅ Contract deployed!${NC}"
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Block Number: $BLOCK_NUMBER_DEC (hex: $BLOCK_NUMBER)"
echo ""

cd ..

# Step 2: Update frontend config
echo -e "${BLUE}Step 2: Updating frontend contract config...${NC}"
cd frontend/lib/contracts

# Update config.ts with new address
cat > config.ts << EOF
import StreamPaymentABI from "./StreamPaymentABI.json";
import type { Abi } from "viem";

export const STREAM_PAYMENT_ADDRESSES = {
  // amoy testnet
  80002: "0xF739B72738a8D99B6955473E2817d558Ea1fFe10",
  // base sepolia testnet
  84532: "$CONTRACT_ADDRESS",
  // 137: '',
  // 8453: '',
} as const;

export const STREAM_PAYMENT_ABI = StreamPaymentABI as Abi;

export const USDC_ADDRESSES = {
  80002: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
} as const;

export const CHAIN_NAMES = {
  80002: "Polygon Amoy",
  137: "Polygon",
  84532: "Base Sepolia",
  8453: "Base",
} as const;

export type SupportedChainId = keyof typeof STREAM_PAYMENT_ADDRESSES;
EOF

# Update ABI from compiled contract
echo "Updating contract ABI..."
cat ../../../contract/out/StreamPayment.sol/StreamPayment.json | jq '.abi' > StreamPaymentABI.json

echo -e "${GREEN}✅ Frontend config updated!${NC}"
echo ""

cd ../../..

# Step 3: Update biconomy.ts with new contract address
echo -e "${BLUE}Step 3: Updating Biconomy config...${NC}"
cd frontend/lib

# Update the contract address in biconomy.ts
sed -i.bak "s/const STREAM_PAYMENT_ADDRESS = STREAM_PAYMENT_ADDRESSES\[.*/const STREAM_PAYMENT_ADDRESS = STREAM_PAYMENT_ADDRESSES[DEFAULT_CHAIN_ID] as \`0x\${string}\`;/" biconomy.ts
rm biconomy.ts.bak

echo -e "${GREEN}✅ Biconomy config updated!${NC}"
echo ""

cd ../..

# Step 4: Update subgraph config
echo -e "${BLUE}Step 4: Updating subgraph config...${NC}"
cd graph

# Update subgraph.yaml with new contract address and start block
cat > subgraph.yaml << EOF
specVersion: 1.3.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: StreamPayment
    network: base-sepolia
    source:
      address: "$CONTRACT_ADDRESS"
      abi: StreamPayment
      startBlock: $BLOCK_NUMBER_DEC
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
        - EarningsWithdrawn
        - OwnershipTransferStarted
        - OwnershipTransferred
        - Paused
        - PlatformFeeUpdated
        - RateChangeAccepted
        - RateChangeCancelled
        - RateChangeProposed
        - StreamCreated
        - StreamExtended
        - StreamStopped
        - Unpaused
      abis:
        - name: StreamPayment
          file: ./abis/StreamPayment.json
      eventHandlers:
        - event: EarningsWithdrawn(indexed address,uint256)
          handler: handleEarningsWithdrawn
        - event: OwnershipTransferStarted(indexed address,indexed address)
          handler: handleOwnershipTransferStarted
        - event: OwnershipTransferred(indexed address,indexed address)
          handler: handleOwnershipTransferred
        - event: Paused(indexed address)
          handler: handlePaused
        - event: PlatformFeeUpdated(uint256,uint256)
          handler: handlePlatformFeeUpdated
        - event: RateChangeAccepted(indexed uint256,uint256,uint256,uint256)
          handler: handleRateChangeAccepted
        - event: RateChangeCancelled(indexed uint256)
          handler: handleRateChangeCancelled
        - event: RateChangeProposed(indexed uint256,uint256,uint256)
          handler: handleRateChangeProposed
        - event: StreamCreated(indexed uint256,indexed address,indexed address,uint256,uint256,uint256)
          handler: handleStreamCreated
        - event: StreamExtended(indexed uint256,uint256,uint256)
          handler: handleStreamExtended
        - event: StreamStopped(indexed uint256,uint256,uint256,uint256)
          handler: handleStreamStopped
        - event: Unpaused(indexed address)
          handler: handleUnpaused
      file: ./src/stream-payment.ts
EOF

# Update ABI in subgraph
echo "Updating subgraph ABI..."
cat ../contract/out/StreamPayment.sol/StreamPayment.json | jq '.abi' > abis/StreamPayment.json

echo -e "${GREEN}✅ Subgraph config updated!${NC}"
echo ""

# Step 5: Build and deploy subgraph
echo -e "${BLUE}Step 5: Building and deploying subgraph...${NC}"

echo "Running codegen..."
graph codegen

echo "Building subgraph..."
graph build

echo ""
echo -e "${YELLOW}⚠️  Now deploy the subgraph manually:${NC}"
echo ""
echo "Run this command:"
echo -e "${GREEN}graph deploy --studio streampay${NC}"
echo ""
echo "After deployment, update your frontend .env with the new subgraph URL"
echo ""

cd ..

# Summary
echo ""
echo "========================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "📝 Summary:"
echo "  - Contract Address: $CONTRACT_ADDRESS"
echo "  - Deployment Block: $BLOCK_NUMBER_DEC"
echo "  - Network: Base Sepolia"
echo "  - Block Explorer: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS"
echo ""
echo "✅ Updated:"
echo "  - Frontend contract config"
echo "  - Frontend contract ABI"
echo "  - Biconomy config"
echo "  - Subgraph config"
echo "  - Subgraph ABI"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy subgraph: cd graph && graph deploy --studio streampay"
echo "  2. Update frontend/.env with new subgraph URL (e.g., v0.0.6)"
echo "  3. Test the application!"
echo ""
echo "========================================"
