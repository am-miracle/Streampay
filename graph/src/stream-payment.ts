import {
  EarningsWithdrawn as EarningsWithdrawnEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  RateChangeAccepted as RateChangeAcceptedEvent,
  RateChangeCancelled as RateChangeCancelledEvent,
  RateChangeProposed as RateChangeProposedEvent,
  StreamCreated as StreamCreatedEvent,
  StreamExtended as StreamExtendedEvent,
  StreamStopped as StreamStoppedEvent,
  Unpaused as UnpausedEvent
} from "../generated/StreamPayment/StreamPayment"
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
} from "../generated/schema"

export function handleEarningsWithdrawn(event: EarningsWithdrawnEvent): void {
  let entity = new EarningsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.admin = event.params.admin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldFee = event.params.oldFee
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRateChangeAccepted(event: RateChangeAcceptedEvent): void {
  let entity = new RateChangeAccepted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId
  entity.oldRate = event.params.oldRate
  entity.newRate = event.params.newRate
  entity.settledAmount = event.params.settledAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRateChangeCancelled(
  event: RateChangeCancelledEvent
): void {
  let entity = new RateChangeCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRateChangeProposed(event: RateChangeProposedEvent): void {
  let entity = new RateChangeProposed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId
  entity.oldRate = event.params.oldRate
  entity.newRate = event.params.newRate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStreamCreated(event: StreamCreatedEvent): void {
  let entity = new StreamCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId
  entity.payer = event.params.payer
  entity.receiver = event.params.receiver
  entity.ratePerSecond = event.params.ratePerSecond
  entity.maxDeposit = event.params.maxDeposit
  entity.startTime = event.params.startTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStreamExtended(event: StreamExtendedEvent): void {
  let entity = new StreamExtended(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId
  entity.additionalDeposit = event.params.additionalDeposit
  entity.newTotalDeposit = event.params.newTotalDeposit

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStreamStopped(event: StreamStoppedEvent): void {
  let entity = new StreamStopped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.streamId = event.params.streamId
  entity.totalPaid = event.params.totalPaid
  entity.refunded = event.params.refunded
  entity.duration = event.params.duration

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.admin = event.params.admin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
