import { useReadContract, useReadContracts } from "wagmi";
import {
  STREAM_PAYMENT_ADDRESSES,
  STREAM_PAYMENT_ABI,
  type SupportedChainId,
} from "@/lib/contracts/config";

export function usePendingEarnings(
  creatorAddress: `0x${string}` | undefined,
  chainId?: SupportedChainId
) {
  return useReadContract({
    address: chainId
      ? STREAM_PAYMENT_ADDRESSES[chainId]
      : STREAM_PAYMENT_ADDRESSES[80002],
    abi: STREAM_PAYMENT_ABI,
    functionName: "getPendingEarnings",
    args: creatorAddress ? [creatorAddress] : undefined,
    query: {
      enabled: !!creatorAddress,
      refetchInterval: 5000,
    },
  });
}

export function useStreamDetails(
  streamId: bigint | undefined,
  chainId?: SupportedChainId
) {
  return useReadContract({
    address: chainId
      ? STREAM_PAYMENT_ADDRESSES[chainId]
      : STREAM_PAYMENT_ADDRESSES[80002],
    abi: STREAM_PAYMENT_ABI,
    functionName: "getStream",
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined,
    },
  });
}

export function useIsStreamDepleted(
  streamId: bigint | undefined,
  chainId?: SupportedChainId
) {
  return useReadContract({
    address: chainId
      ? STREAM_PAYMENT_ADDRESSES[chainId]
      : STREAM_PAYMENT_ADDRESSES[80002],
    abi: STREAM_PAYMENT_ABI,
    functionName: "isStreamDepleted",
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined,
      refetchInterval: 10000,
    },
  });
}

export function useProposedRate(
  streamId: bigint | undefined,
  chainId?: SupportedChainId
) {
  return useReadContract({
    address: chainId
      ? STREAM_PAYMENT_ADDRESSES[chainId]
      : STREAM_PAYMENT_ADDRESSES[80002],
    abi: STREAM_PAYMENT_ABI,
    functionName: "getProposedRate",
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined,
    },
  });
}

export function usePlatformFee(chainId?: SupportedChainId) {
  return useReadContract({
    address: chainId
      ? STREAM_PAYMENT_ADDRESSES[chainId]
      : STREAM_PAYMENT_ADDRESSES[80002],
    abi: STREAM_PAYMENT_ABI,
    functionName: "platformFee",
  });
}

export function useContractConstants(chainId?: SupportedChainId) {
  const contractAddress = chainId
    ? STREAM_PAYMENT_ADDRESSES[chainId]
    : STREAM_PAYMENT_ADDRESSES[80002];

  return useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: STREAM_PAYMENT_ABI,
        functionName: "MIN_DEPOSIT",
      },
      {
        address: contractAddress,
        abi: STREAM_PAYMENT_ABI,
        functionName: "MAX_DEPOSIT",
      },
      {
        address: contractAddress,
        abi: STREAM_PAYMENT_ABI,
        functionName: "platformFee",
      },
      {
        address: contractAddress,
        abi: STREAM_PAYMENT_ABI,
        functionName: "usdcToken",
      },
    ],
  });
}

export function useMultipleStreams(
  streamIds: bigint[],
  chainId?: SupportedChainId
) {
  const contractAddress = chainId
    ? STREAM_PAYMENT_ADDRESSES[chainId]
    : STREAM_PAYMENT_ADDRESSES[80002];

  const contracts = streamIds.map((streamId) => ({
    address: contractAddress,
    abi: STREAM_PAYMENT_ABI,
    functionName: "getStream" as const,
    args: [streamId],
  }));

  return useReadContracts({
    contracts,
    query: {
      enabled: streamIds.length > 0,
    },
  });
}
