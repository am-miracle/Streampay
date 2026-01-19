"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletClient } from "wagmi";
import {
  initializeSmartAccount,
  createStreamGasless,
  stopStreamGasless,
  extendStreamGasless,
  isInitialized,
  getStream,
  getStreamedAmount,
} from "@/lib/biconomy";

export function useBiconomyGasless() {
  const { data: walletClient } = useWalletClient({ chainId: 84532 }); // Base Sepolia
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!walletClient || isInitialized()) return;

      setIsInitializing(true);
      setError(null);

      try {
        const { smartAccountAddress: scaAddress } =
          await initializeSmartAccount(walletClient);
        setSmartAccountAddress(scaAddress);
      } catch (err) {
        console.error("Failed to initialize smart account:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize smart account"
        );
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [walletClient]);

  return {
    smartAccountAddress,
    isInitializing,
    error,
    isReady: isInitialized() && smartAccountAddress !== null,
  };
}

export function useCreateStreamGasless() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<bigint | null>(null);

  const createStream = useCallback(
    async (
      creatorAddress: string,
      ratePerMinute: number,
      depositDollars: number
    ) => {
      setIsPending(true);
      setError(null);

      try {
        const result = await createStreamGasless(
          creatorAddress,
          ratePerMinute,
          depositDollars
        );
        setStreamId(result.streamId);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create stream";
        setError(errorMsg);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return {
    createStream,
    isPending,
    error,
    streamId,
  };
}

export function useStopStreamGasless() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(async (streamId: bigint) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await stopStreamGasless(streamId);
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to stop stream";
      setError(errorMsg);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    stopStream,
    isPending,
    error,
  };
}

export function useExtendStreamGasless() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extendStream = useCallback(
    async (streamId: bigint, additionalDollars: number) => {
      setIsPending(true);
      setError(null);

      try {
        const result = await extendStreamGasless(streamId, additionalDollars);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to extend stream";
        setError(errorMsg);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return {
    extendStream,
    isPending,
    error,
  };
}

export function useStreamData(streamId: bigint | null) {
  const [stream, setStream] = useState<any>(null);
  const [streamedAmount, setStreamedAmount] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!streamId) return;

    setIsLoading(true);
    try {
      const [streamData, amount] = await Promise.all([
        getStream(streamId),
        getStreamedAmount(streamId),
      ]);
      setStream(streamData);
      setStreamedAmount(amount);
    } catch (err) {
      console.error("Failed to fetch stream data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!streamId || !stream?.isActive) return;

    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [streamId, stream?.isActive, refetch]);

  return {
    stream,
    streamedAmount,
    isLoading,
    refetch,
  };
}
