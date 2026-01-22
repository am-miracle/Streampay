# StreamPay - Gasless Micropayment Streaming

> Pay-per-second for content without gas fees, subscriptions, or minimums.

## The Problem
The internet has a big micropayment problem that slows down the growth of the creator economy, which is worth $1.5 trillion. Current payment methods, like credit cards, charge high fees about 30 cents plus 2.9%. This makes small transactions hard to manage. Traditional cryptocurrency options are even worse, with gas fees between $0.50 and $5. Because of this, many services are switching to subscription models. This forces people to pay monthly fees for services they might not use often. As a result, about 90% of potential customers feel excluded from subscriptions, creating financial barriers for the creator economy.

## Our Solution
StreamPay offers a solution with true pay-per-second micropayments that have no gas fees. Using ERC-4337 account abstraction, users pay only for what they use just $0.02 per minute. There’s no need for credit cards or complicated forms. Payments stop automatically when users close the tab, and integration takes just five lines of code for quick settlement. This new approach aims to change micropayments and unlock the full potential of the creator economy.

## How It Works
1. User connects wallet, approves spending limit
2. Clicks "Start Streaming" on content
3. Payment counter runs in real-time
4. User closes tab → contract settles exact amount owed
5. Zero gas fees paid by user (sponsored by platform)

![Architecture diagram](assets/diagram.png)

## Tech Stack
- Smart Contracts: Solidity (Base sepolia)
- Account Abstraction: Biconomy SDK
- Frontend: Next.js + Wagmi
- Payments: USDC stablecoin

## Use Cases
- Pay-per-article for blogs
- Pay-per-minute for tutorials
- Pay-per-API-call for services
- Tip streaming for creators

## Try It
[Link to demo]()
Contract: 0xB1686a2c0eE7ebCf9Aea3883BCb652D39F881727 (base sepolia)
