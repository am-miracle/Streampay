import { useState, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  CONTRACTS,
  STREAM_PAYMENT_ABI,
  DEMO_CREATOR,
  RATES,
} from "@/lib/contracts";

export interface StreamState {
  isActive: boolean;
  streamId: bigint | null;
  startTime: number | null;
  currentAmount: string;
  estimatedCost: string;
}

export function useStream() {
  const { address } = useAccount();
  const [streamState, setStreamState] = useState<StreamState>({
    isActive: false,
    streamId: null,
    startTime: null,
    currentAmount: "0.0000",
    estimatedCost: "0.0000",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    writeContract: createStream,
    data: createTxHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: createTxHash,
    });

  const {
    writeContract: stopStreamTx,
    isPending: isStopping,
    error: stopError,
  } = useWriteContract();

  const updateStreamAmount = useCallback(() => {
    if (!streamState.isActive || !streamState.startTime) return;

    const elapsed = (Date.now() - streamState.startTime) / 1000;
    const amount = elapsed * Number(formatUnits(RATES.PER_SECOND, 6));

    setStreamState((prev) => ({
      ...prev,
      currentAmount: amount.toFixed(4),
      estimatedCost: amount.toFixed(4),
    }));
  }, [streamState.isActive, streamState.startTime]);

  useEffect(() => {
    if (streamState.isActive) {
      intervalRef.current = setInterval(updateStreamAmount, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamState.isActive, updateStreamAmount]);

  const startStream = useCallback(async () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      const now = Date.now();
      setStreamState({
        isActive: true,
        streamId: null,
        startTime: now,
        currentAmount: "0.0000",
        estimatedCost: "0.0000",
      });

      const maxDeposit = parseUnits("0.50", 6); // Max $0.50

      createStream({
        address: CONTRACTS.STREAM_PAYMENT,
        abi: STREAM_PAYMENT_ABI,
        functionName: "createStream",
        args: [DEMO_CREATOR, RATES.PER_SECOND, maxDeposit],
      });

      // Transaction will be confirmed via useWaitForTransactionReceipt
    } catch (error) {
      setStreamState({
        isActive: false,
        streamId: null,
        startTime: null,
        currentAmount: "0.0000",
        estimatedCost: "0.0000",
      });
      throw error;
    }
  }, [address, createStream]);

  const stopStream = useCallback(async () => {
    if (!streamState.streamId) {
      setStreamState({
        isActive: false,
        streamId: null,
        startTime: null,
        currentAmount: streamState.currentAmount,
        estimatedCost: streamState.estimatedCost,
      });
      return;
    }

    try {
      setStreamState((prev) => ({ ...prev, isActive: false }));

      stopStreamTx({
        address: CONTRACTS.STREAM_PAYMENT,
        abi: STREAM_PAYMENT_ABI,
        functionName: "stopStream",
        args: [streamState.streamId],
      });
    } catch (error) {
      throw error;
    }
  }, [
    streamState.streamId,
    streamState.currentAmount,
    streamState.estimatedCost,
    stopStreamTx,
  ]);

  // Update streamId when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && createTxHash) {
      // In a real app, parse the transaction receipt for the actual streamId
      // For demo, we'll use a dummy value
      const dummyStreamId = BigInt(Math.floor(Math.random() * 1000000));
      setStreamState((prev) => ({
        ...prev,
        streamId: dummyStreamId,
      }));
    }
  }, [isConfirmed, createTxHash]);

  return {
    streamState,
    startStream,
    stopStream,
    isCreating,
    isConfirming,
    isStopping,
    createError,
    stopError,
    isConnected: !!address,
  };
}
