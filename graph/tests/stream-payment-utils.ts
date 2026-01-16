import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EarningsWithdrawn,
  OwnershipTransferStarted,
  OwnershipTransferred,
  Paused,
  PlatformFeeUpdated,
  RateChangeAccepted,
  RateChangeCancelled,
  RateChangeProposed,
  StreamCreated,
  StreamExtended,
  StreamStopped,
  Unpaused
} from "../generated/StreamPayment/StreamPayment"

export function createEarningsWithdrawnEvent(
  creator: Address,
  amount: BigInt
): EarningsWithdrawn {
  let earningsWithdrawnEvent = changetype<EarningsWithdrawn>(newMockEvent())

  earningsWithdrawnEvent.parameters = new Array()

  earningsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  earningsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return earningsWithdrawnEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(admin: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return pausedEvent
}

export function createPlatformFeeUpdatedEvent(
  oldFee: BigInt,
  newFee: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldFee", ethereum.Value.fromUnsignedBigInt(oldFee))
  )
  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return platformFeeUpdatedEvent
}

export function createRateChangeAcceptedEvent(
  streamId: BigInt,
  oldRate: BigInt,
  newRate: BigInt,
  settledAmount: BigInt
): RateChangeAccepted {
  let rateChangeAcceptedEvent = changetype<RateChangeAccepted>(newMockEvent())

  rateChangeAcceptedEvent.parameters = new Array()

  rateChangeAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )
  rateChangeAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRate",
      ethereum.Value.fromUnsignedBigInt(oldRate)
    )
  )
  rateChangeAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "newRate",
      ethereum.Value.fromUnsignedBigInt(newRate)
    )
  )
  rateChangeAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "settledAmount",
      ethereum.Value.fromUnsignedBigInt(settledAmount)
    )
  )

  return rateChangeAcceptedEvent
}

export function createRateChangeCancelledEvent(
  streamId: BigInt
): RateChangeCancelled {
  let rateChangeCancelledEvent = changetype<RateChangeCancelled>(newMockEvent())

  rateChangeCancelledEvent.parameters = new Array()

  rateChangeCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )

  return rateChangeCancelledEvent
}

export function createRateChangeProposedEvent(
  streamId: BigInt,
  oldRate: BigInt,
  newRate: BigInt
): RateChangeProposed {
  let rateChangeProposedEvent = changetype<RateChangeProposed>(newMockEvent())

  rateChangeProposedEvent.parameters = new Array()

  rateChangeProposedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )
  rateChangeProposedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRate",
      ethereum.Value.fromUnsignedBigInt(oldRate)
    )
  )
  rateChangeProposedEvent.parameters.push(
    new ethereum.EventParam(
      "newRate",
      ethereum.Value.fromUnsignedBigInt(newRate)
    )
  )

  return rateChangeProposedEvent
}

export function createStreamCreatedEvent(
  streamId: BigInt,
  payer: Address,
  receiver: Address,
  ratePerSecond: BigInt,
  maxDeposit: BigInt,
  startTime: BigInt
): StreamCreated {
  let streamCreatedEvent = changetype<StreamCreated>(newMockEvent())

  streamCreatedEvent.parameters = new Array()

  streamCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )
  streamCreatedEvent.parameters.push(
    new ethereum.EventParam("payer", ethereum.Value.fromAddress(payer))
  )
  streamCreatedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  streamCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "ratePerSecond",
      ethereum.Value.fromUnsignedBigInt(ratePerSecond)
    )
  )
  streamCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxDeposit",
      ethereum.Value.fromUnsignedBigInt(maxDeposit)
    )
  )
  streamCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )

  return streamCreatedEvent
}

export function createStreamExtendedEvent(
  streamId: BigInt,
  additionalDeposit: BigInt,
  newTotalDeposit: BigInt
): StreamExtended {
  let streamExtendedEvent = changetype<StreamExtended>(newMockEvent())

  streamExtendedEvent.parameters = new Array()

  streamExtendedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )
  streamExtendedEvent.parameters.push(
    new ethereum.EventParam(
      "additionalDeposit",
      ethereum.Value.fromUnsignedBigInt(additionalDeposit)
    )
  )
  streamExtendedEvent.parameters.push(
    new ethereum.EventParam(
      "newTotalDeposit",
      ethereum.Value.fromUnsignedBigInt(newTotalDeposit)
    )
  )

  return streamExtendedEvent
}

export function createStreamStoppedEvent(
  streamId: BigInt,
  totalPaid: BigInt,
  refunded: BigInt,
  duration: BigInt
): StreamStopped {
  let streamStoppedEvent = changetype<StreamStopped>(newMockEvent())

  streamStoppedEvent.parameters = new Array()

  streamStoppedEvent.parameters.push(
    new ethereum.EventParam(
      "streamId",
      ethereum.Value.fromUnsignedBigInt(streamId)
    )
  )
  streamStoppedEvent.parameters.push(
    new ethereum.EventParam(
      "totalPaid",
      ethereum.Value.fromUnsignedBigInt(totalPaid)
    )
  )
  streamStoppedEvent.parameters.push(
    new ethereum.EventParam(
      "refunded",
      ethereum.Value.fromUnsignedBigInt(refunded)
    )
  )
  streamStoppedEvent.parameters.push(
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    )
  )

  return streamStoppedEvent
}

export function createUnpausedEvent(admin: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )

  return unpausedEvent
}
