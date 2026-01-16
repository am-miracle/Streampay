import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, STREAM_PAYMENT_ABI, ERC20_ABI } from '@/lib/contracts'
import { parseUnits } from 'viem'

export function useCreateStream() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createStream = async ({
    receiver,
    ratePerSecond,
    maxDeposit,
  }: {
    receiver: `0x${string}`
    ratePerSecond: bigint
    maxDeposit: bigint
  }) => {
    return writeContract({
      address: CONTRACTS.STREAM_PAYMENT,
      abi: STREAM_PAYMENT_ABI,
      functionName: 'createStream',
      args: [receiver, ratePerSecond, maxDeposit],
    })
  }

  return {
    createStream,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useStopStream() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const stopStream = async (streamId: bigint) => {
    return writeContract({
      address: CONTRACTS.STREAM_PAYMENT,
      abi: STREAM_PAYMENT_ABI,
      functionName: 'stopStream',
      args: [streamId],
    })
  }

  return {
    stopStream,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useStreamedAmount(streamId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.STREAM_PAYMENT,
    abi: STREAM_PAYMENT_ABI,
    functionName: 'getStreamedAmount',
    args: streamId !== undefined ? [streamId] : undefined,
    query: {
      enabled: streamId !== undefined,
      refetchInterval: 1000, // Update every second
    },
  })

  return {
    amount: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  }
}

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (amount: bigint) => {
    return writeContract({
      address: CONTRACTS.USDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.STREAM_PAYMENT, amount],
    })
  }

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useUSDCAllowance(owner?: `0x${string}`) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, CONTRACTS.STREAM_PAYMENT] : undefined,
    query: {
      enabled: !!owner,
    },
  })

  return {
    allowance: data as bigint | undefined,
    isLoading,
    error,
  }
}

export function useUSDCBalance(address?: `0x${string}`) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  }
}
