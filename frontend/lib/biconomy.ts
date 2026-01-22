import {
  createMeeClient,
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  DEFAULT_MEE_TESTNET_SPONSORSHIP_PAYMASTER_ACCOUNT,
  DEFAULT_MEE_TESTNET_SPONSORSHIP_TOKEN_ADDRESS,
  DEFAULT_MEE_TESTNET_SPONSORSHIP_CHAIN_ID,
  DEFAULT_PATHFINDER_URL,
} from "@biconomy/abstractjs";
import {
  http,
  encodeFunctionData,
  parseUnits,
  decodeEventLog,
  createPublicClient,
  type Log,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  STREAM_PAYMENT_ADDRESSES,
  STREAM_PAYMENT_ABI,
  USDC_ADDRESSES,
  SupportedChainId,
} from "./contracts/config";

const API_KEY = process.env.NEXT_PUBLIC_BICONOMY_API_KEY!;

const DEFAULT_CHAIN_ID: SupportedChainId = 84532;

const STREAM_PAYMENT_ADDRESS = STREAM_PAYMENT_ADDRESSES[
  DEFAULT_CHAIN_ID
] as `0x${string}`;
const USDC_ADDRESS = USDC_ADDRESSES[DEFAULT_CHAIN_ID] as `0x${string}`;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const TESTNET_SPONSORSHIP_CONFIG = {
  url: DEFAULT_PATHFINDER_URL,
  gasTank: {
    address: DEFAULT_MEE_TESTNET_SPONSORSHIP_PAYMASTER_ACCOUNT,
    token: DEFAULT_MEE_TESTNET_SPONSORSHIP_TOKEN_ADDRESS,
    chainId: DEFAULT_MEE_TESTNET_SPONSORSHIP_CHAIN_ID,
  },
};

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    `https://base-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API}`
  ),
  pollingInterval: 2000,
});

let meeClient: any | null = null;
let nexusAccount: any | null = null;
let smartAccountAddress: string | null = null;

export async function initializeSmartAccount(walletClient: any): Promise<{
  smartAccountAddress: string;
  eoaAddress: string;
}> {
  const eoaAddress = walletClient.account?.address;

  if (!eoaAddress) {
    throw new Error("No account found in wallet client");
  }

  console.log("Initializing Nexus account for EOA:", eoaAddress);
  console.log("Chain:", baseSepolia.id);

  nexusAccount = await toMultichainNexusAccount({
    signer: walletClient,
    chainConfigurations: [
      {
        chain: baseSepolia,
        transport: http(
          `https://base-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API}`
        ),
        version: getMEEVersion(MEEVersion.V2_1_0),
      },
    ],
  });

  const scaAddress = await nexusAccount.addressOn(baseSepolia.id);
  console.log("Nexus account address on Base Sepolia:", scaAddress);

  if (!API_KEY) {
    throw new Error(
      "Biconomy API key not configured. Please add NEXT_PUBLIC_BICONOMY_API_KEY to your .env.local file. Get your key from https://dashboard.biconomy.io/"
    );
  }

  meeClient = await createMeeClient({
    account: nexusAccount,
    apiKey: API_KEY,
  });

  if (!scaAddress) {
    throw new Error("Failed to get smart account address from Nexus account");
  }

  smartAccountAddress = scaAddress;
  console.log("Smart account address set to:", scaAddress);

  return {
    smartAccountAddress: scaAddress,
    eoaAddress,
  };
}

export function getSmartAccountAddress(): string | null {
  return smartAccountAddress;
}

export function isInitialized(): boolean {
  return meeClient !== null && nexusAccount !== null;
}

export async function createStreamGasless(
  creatorAddress: string,
  ratePerMinute: number,
  depositDollars: number
): Promise<{
  streamId: bigint;
  txHash: string;
  userOpHash: string;
}> {
  if (!meeClient || !nexusAccount) {
    throw new Error("Smart account not initialized.");
  }

  const ratePerSecond = BigInt(Math.floor((ratePerMinute / 60) * 1e6));
  const depositAmount = parseUnits(depositDollars.toString(), 6);
  let txHash = "";

  try {
    console.log("Creating stream...");

    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: USDC_ADDRESS,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: "approve",
                args: [STREAM_PAYMENT_ADDRESS, depositAmount],
              }),
            },
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: "createStream",
                args: [
                  creatorAddress as `0x${string}`,
                  ratePerSecond,
                  depositAmount,
                ],
              }),
            },
          ],
        },
      ],
    });

    txHash = hash;
    console.log("Transaction sent. Hash:", hash);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });

    const streamId = parseStreamCreatedEvent(receipt.logs) ?? BigInt(0);

    return {
      streamId,
      txHash: hash,
      userOpHash: hash,
    };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      console.warn(
        "⚠️ Transaction timed out, but likely succeeded. Fetching latest stream ID..."
      );

      try {
        const totalStreams = (await publicClient.readContract({
          address: STREAM_PAYMENT_ADDRESS,
          abi: STREAM_PAYMENT_ABI,
          functionName: "getTotalStreams",
        })) as bigint;

        // The latest ID is always (Total - 1) because IDs start at 0
        const latestId =
          totalStreams > BigInt(0) ? totalStreams - BigInt(1) : BigInt(0);

        console.log("Recovered Stream ID:", latestId.toString());

        return {
          streamId: latestId,
          txHash: txHash,
          userOpHash: txHash,
        };
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        throw error;
      }
    }

    console.error("Execute transaction error:", error);
    throw error;
  }
}

export async function stopStreamGasless(streamId: bigint): Promise<{
  txHash: string;
  userOpHash: string;
  totalPaid: bigint;
  refunded: bigint;
  duration: bigint;
}> {
  if (!meeClient || !nexusAccount)
    throw new Error("Smart account not initialized.");

  let txHash = "";

  try {
    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: "stopStream",
                args: [streamId],
              }),
            },
          ],
        },
      ],
    });

    txHash = hash;
    console.log("Stopping stream... Hash:", hash);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });

    const stoppedEvent = parseStreamStoppedEvent(receipt.logs);

    return {
      txHash: hash,
      userOpHash: hash,
      totalPaid: stoppedEvent?.totalPaid ?? BigInt(0),
      refunded: stoppedEvent?.refunded ?? BigInt(0),
      duration: stoppedEvent?.duration ?? BigInt(0),
    };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      console.warn("Stop transaction timed out, assuming success.");
      return {
        txHash: txHash,
        userOpHash: txHash,
        totalPaid: BigInt(0),
        refunded: BigInt(0),
        duration: BigInt(0),
      };
    }
    throw error;
  }
}

export async function extendStreamGasless(
  streamId: bigint,
  additionalDollars: number
): Promise<{
  txHash: string;
  userOpHash: string;
}> {
  if (!meeClient || !nexusAccount)
    throw new Error("Smart account not initialized.");

  const additionalDeposit = parseUnits(additionalDollars.toString(), 6);
  let txHash = "";

  try {
    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: USDC_ADDRESS,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: "approve",
                args: [STREAM_PAYMENT_ADDRESS, additionalDeposit],
              }),
            },
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: "extendStream",
                args: [streamId, additionalDeposit],
              }),
            },
          ],
        },
      ],
    });

    txHash = hash;

    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });

    return { txHash: hash, userOpHash: hash };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      return { txHash: txHash, userOpHash: txHash };
    }
    throw error;
  }
}

export async function batchStopStreamsGasless(streamIds: bigint[]): Promise<{
  txHash: string;
  userOpHash: string;
}> {
  if (!meeClient || !nexusAccount)
    throw new Error("Smart account not initialized.");
  let txHash = "";

  try {
    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: "batchStopStreams",
                args: [streamIds],
              }),
            },
          ],
        },
      ],
    });

    txHash = hash;

    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });

    return { txHash: hash, userOpHash: hash };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      return { txHash: txHash, userOpHash: txHash };
    }
    throw error;
  }
}

export async function withdrawEarningsGasless(): Promise<{
  txHash: string;
  userOpHash: string;
}> {
  if (!meeClient || !nexusAccount)
    throw new Error("Smart account not initialized.");
  let txHash = "";

  try {
    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: "withdrawEarnings",
                args: [],
              }),
            },
          ],
        },
      ],
    });

    txHash = hash;

    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });

    return { txHash: hash, userOpHash: hash };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      return { txHash: txHash, userOpHash: txHash };
    }
    throw error;
  }
}

async function executeRateFunction(functionName: string, args: any[]) {
  if (!meeClient || !nexusAccount)
    throw new Error("Smart account not initialized.");
  let txHash = "";

  try {
    const { hash } = await meeClient.execute({
      sponsorship: true,
      sponsorshipOptions: TESTNET_SPONSORSHIP_CONFIG,
      instructions: [
        {
          chainId: baseSepolia.id,
          calls: [
            {
              to: STREAM_PAYMENT_ADDRESS,
              data: encodeFunctionData({
                abi: STREAM_PAYMENT_ABI,
                functionName: functionName,
                args: args,
              }),
            },
          ],
        },
      ],
    });
    txHash = hash;
    await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
      timeout: 60_000,
    });
    return { txHash: hash, userOpHash: hash };
  } catch (error: any) {
    if (error.name === "WaitForTransactionReceiptTimeoutError" && txHash) {
      return { txHash: txHash, userOpHash: txHash };
    }
    throw error;
  }
}

export async function proposeRateChangeGasless(
  streamId: bigint,
  newRatePerMinute: number
) {
  const newRatePerSecond = BigInt(Math.floor((newRatePerMinute / 60) * 1e6));
  return executeRateFunction("proposeRateChange", [streamId, newRatePerSecond]);
}

export async function acceptRateChangeGasless(streamId: bigint) {
  return executeRateFunction("acceptRateChange", [streamId]);
}

export async function cancelRateChangeGasless(streamId: bigint) {
  return executeRateFunction("cancelRateChange", [streamId]);
}

function parseStreamCreatedEvent(logs: Log[]): bigint | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: STREAM_PAYMENT_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "StreamCreated" && decoded.args) {
        const args = decoded.args as unknown as { streamId: bigint };
        return args.streamId;
      }
    } catch {
      // Not a StreamCreated event, continue
    }
  }
  return null;
}

function parseStreamStoppedEvent(logs: Log[]): {
  totalPaid: bigint;
  refunded: bigint;
  duration: bigint;
} | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: STREAM_PAYMENT_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "StreamStopped" && decoded.args) {
        const args = decoded.args as unknown as {
          totalPaid: bigint;
          refunded: bigint;
          duration: bigint;
        };
        return {
          totalPaid: args.totalPaid,
          refunded: args.refunded,
          duration: args.duration,
        };
      }
    } catch {
      // Not a StreamStopped event, continue
    }
  }
  return null;
}

export async function getStream(streamId: bigint) {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getStream",
    args: [streamId],
  });
}

export async function getStreamedAmount(streamId: bigint): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getStreamedAmount",
    args: [streamId],
  }) as Promise<bigint>;
}

export async function getCreatorEarnings(
  creatorAddress: string
): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getCreatorEarnings",
    args: [creatorAddress as `0x${string}`],
  }) as Promise<bigint>;
}

export async function getCreatorTotalEarned(
  creatorAddress: string
): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getCreatorTotalEarned",
    args: [creatorAddress as `0x${string}`],
  }) as Promise<bigint>;
}

export async function getCreatorActiveStreamCount(
  creatorAddress: string
): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getCreatorActiveStreamCount",
    args: [creatorAddress as `0x${string}`],
  }) as Promise<bigint>;
}

export async function isStreamDepleted(streamId: bigint): Promise<boolean> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "isStreamDepleted",
    args: [streamId],
  }) as Promise<boolean>;
}

export async function getProposedRate(streamId: bigint): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getProposedRate",
    args: [streamId],
  }) as Promise<bigint>;
}

export async function getTotalStreams(): Promise<bigint> {
  return publicClient.readContract({
    address: STREAM_PAYMENT_ADDRESS,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getTotalStreams",
    args: [],
  }) as Promise<bigint>;
}

export { STREAM_PAYMENT_ADDRESS, USDC_ADDRESS, DEFAULT_CHAIN_ID, publicClient };
