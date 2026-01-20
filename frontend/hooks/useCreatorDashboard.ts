import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql-client'
import {
  GET_CREATOR_DASHBOARD,
  GET_STREAM_HISTORY,
  GET_WITHDRAWAL_HISTORY,
  type CreatorDashboardResponse,
  type StreamHistoryResponse,
  type WithdrawalHistoryResponse
} from '@/lib/queries'

export function useCreatorDashboard(creatorAddress: string | undefined) {
  return useQuery({
    queryKey: ['creatorDashboard', creatorAddress],
    queryFn: async () => {
      if (!creatorAddress) throw new Error('Creator address required')

      const data = await graphQLClient.request<CreatorDashboardResponse>(
        GET_CREATOR_DASHBOARD,
        { creatorAddress: creatorAddress.toLowerCase() }
      )
      return data.creator
    },
    enabled: !!creatorAddress,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  })
}

export function useStreamHistory(
  creatorAddress: string | undefined,
  options?: { first?: number; skip?: number }
) {
  const { first = 10, skip = 0 } = options || {}

  return useQuery({
    queryKey: ['streamHistory', creatorAddress, first, skip],
    queryFn: async () => {
      if (!creatorAddress) throw new Error('Creator address required')

      const data = await graphQLClient.request<StreamHistoryResponse>(
        GET_STREAM_HISTORY,
        {
          creatorAddress: creatorAddress.toLowerCase(),
          first,
          skip
        }
      )
      return data.streams
    },
    enabled: !!creatorAddress,
  })
}

export function useWithdrawalHistory(
  creatorAddress: string | undefined,
  options?: { first?: number; skip?: number }
) {
  const { first = 10, skip = 0 } = options || {}

  return useQuery({
    queryKey: ['withdrawalHistory', creatorAddress, first, skip],
    queryFn: async () => {
      if (!creatorAddress) throw new Error('Creator address required')

      const data = await graphQLClient.request<WithdrawalHistoryResponse>(
        GET_WITHDRAWAL_HISTORY,
        {
          creatorAddress: creatorAddress.toLowerCase(),
          first,
          skip
        }
      )
      return data.earningsWithdrawns
    },
    enabled: !!creatorAddress,
  })
}
