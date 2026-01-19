import { gql } from "graphql-request";

export const GET_CREATOR_DASHBOARD = gql`
  query GetCreatorDashboard($creatorAddress: Bytes!) {
    creator(id: $creatorAddress) {
      id
      totalEarned
      activeStreamCount
      totalStreamCount
      uniqueViewers
      totalViewersCount
      streams(
        where: { isActive: true }
        orderBy: createdAtTimestamp
        orderDirection: desc
      ) {
        id
        streamId
        payer
        ratePerSecond
        ratePerMinute
        deposit
        startTime
        createdAtTimestamp
        isActive
      }
    }
  }
`;

export const GET_STREAM_HISTORY = gql`
  query GetStreamHistory($creatorAddress: Bytes!, $first: Int!, $skip: Int!) {
    streams(
      where: { receiver: $creatorAddress, isActive: false }
      orderBy: stoppedAtTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      streamId
      payer
      ratePerSecond
      ratePerMinute
      deposit
      startTime
      endTime
      duration
      totalPaid
      refunded
      stoppedAtTimestamp
    }
  }
`;

// Query to get active streams for a creator
export const GET_ACTIVE_STREAMS = gql`
  query GetActiveStreams($creatorAddress: Bytes!) {
    streams(
      where: { receiver: $creatorAddress, isActive: true }
      orderBy: startTime
      orderDirection: desc
    ) {
      id
      streamId
      payer
      ratePerSecond
      ratePerMinute
      deposit
      startTime
      createdAtTimestamp
      isActive
    }
  }
`;

// Query to get creator earnings withdrawal history
export const GET_WITHDRAWAL_HISTORY = gql`
  query GetWithdrawalHistory(
    $creatorAddress: Bytes!
    $first: Int!
    $skip: Int!
  ) {
    earningsWithdrawns(
      where: { creatorAddress: $creatorAddress }
      orderBy: blockTimestamp
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      id
      amount
      blockTimestamp
      transactionHash
    }
  }
`;

// Query to get a specific stream details
export const GET_STREAM_DETAILS = gql`
  query GetStreamDetails($streamId: ID!) {
    stream(id: $streamId) {
      id
      streamId
      payer
      receiver {
        id
      }
      ratePerSecond
      ratePerMinute
      deposit
      startTime
      endTime
      duration
      totalPaid
      refunded
      isActive
      createdAtTimestamp
      stoppedAtTimestamp
    }
  }
`;

// Query to get all stream events for a specific stream
export const GET_STREAM_EVENTS = gql`
  query GetStreamEvents($streamId: BigInt!) {
    streamCreated: streamCreateds(where: { streamId: $streamId }) {
      id
      streamId
      payer
      receiver
      ratePerSecond
      maxDeposit
      startTime
      blockTimestamp
      transactionHash
    }

    streamExtended: streamExtendeds(
      where: { streamId: $streamId }
      orderBy: blockTimestamp
    ) {
      id
      additionalDeposit
      newTotalDeposit
      blockTimestamp
      transactionHash
    }

    rateChangeProposed: rateChangeProposeds(
      where: { streamId: $streamId }
      orderBy: blockTimestamp
    ) {
      id
      oldRate
      newRate
      blockTimestamp
      transactionHash
    }

    rateChangeAccepted: rateChangeAccepteds(
      where: { streamId: $streamId }
      orderBy: blockTimestamp
    ) {
      id
      oldRate
      newRate
      settledAmount
      blockTimestamp
      transactionHash
    }

    streamStopped: streamStoppeds(where: { streamId: $streamId }) {
      id
      totalPaid
      refunded
      duration
      blockTimestamp
      transactionHash
    }
  }
`;

// Types for query responses
export interface Creator {
  id: string;
  totalEarned: string;
  activeStreamCount: number;
  totalStreamCount: number;
  uniqueViewers: string[];
  totalViewersCount: number;
  streams: Stream[];
}

export interface Stream {
  id: string;
  streamId: string;
  payer: string;
  ratePerSecond: string;
  ratePerMinute: string;
  deposit: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  totalPaid?: string;
  refunded?: string;
  isActive: boolean;
  createdAtTimestamp: string;
  stoppedAtTimestamp?: string;
}

export interface EarningsWithdrawn {
  id: string;
  amount: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface CreatorDashboardResponse {
  creator: Creator | null;
}

export interface StreamHistoryResponse {
  streams: Stream[];
}

export interface WithdrawalHistoryResponse {
  earningsWithdrawns: EarningsWithdrawn[];
}

export interface StreamDetailsResponse {
  stream: Stream | null;
}
