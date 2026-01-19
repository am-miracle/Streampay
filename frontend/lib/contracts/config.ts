import StreamPaymentABI from "./StreamPaymentABI.json";
import type { Abi } from "viem";

export const STREAM_PAYMENT_ADDRESSES = {
  // amoy testnet
  80002: "0xF739B72738a8D99B6955473E2817d558Ea1fFe10",
  // base sepolia testnet
  84532: "0xB1686a2c0eE7ebCf9Aea3883BCb652D39F881727",
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
