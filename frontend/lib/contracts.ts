export const CONTRACTS = {
  STREAM_PAYMENT: "0x1234567890123456789012345678901234567890" as `0x${string}`,
  USDC: "0x0987654321098765432109876543210987654321" as `0x${string}`,
} as const;

export const STREAM_PAYMENT_ABI = [
  {
    name: "createStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "ratePerSecond", type: "uint256" },
      { name: "maxDeposit", type: "uint256" },
    ],
    outputs: [{ name: "streamId", type: "uint256" }],
  },
  {
    name: "stopStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getStreamedAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    name: "StreamCreated",
    type: "event",
    inputs: [
      { name: "streamId", type: "uint256", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "ratePerSecond", type: "uint256", indexed: false },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "remaining", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export const DEMO_CREATOR =
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`;

export const RATES = {
  PER_SECOND: BigInt(333), // ~$0.02/minute
  PER_MINUTE: BigInt(333 * 60),
} as const;
