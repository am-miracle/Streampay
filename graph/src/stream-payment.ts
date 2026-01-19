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
  Unpaused as UnpausedEvent,
} from "../generated/StreamPayment/StreamPayment";
import {
  Creator,
  Stream,
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
  Unpaused,
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

// Helper function to get or create a Creator entity
function getOrCreateCreator(creatorAddress: Bytes): Creator {
  let creator = Creator.load(creatorAddress);
  if (creator == null) {
    creator = new Creator(creatorAddress);
    creator.totalEarned = BigInt.zero();
    creator.activeStreamCount = 0;
    creator.totalStreamCount = 0;
    creator.uniqueViewers = [];
    creator.totalViewersCount = 0;
    creator.save();
  }
  return creator;
}

// Helper function to add a unique viewer to creator
function addUniqueViewer(creator: Creator, payerAddress: Bytes): void {
  let viewers = creator.uniqueViewers;
  let isNew = true;
  for (let i = 0; i < viewers.length; i++) {
    if (viewers[i].equals(payerAddress)) {
      isNew = false;
      break;
    }
  }
  if (isNew) {
    viewers.push(payerAddress);
    creator.uniqueViewers = viewers;
    creator.totalViewersCount = viewers.length;
  }
}

export function handleEarningsWithdrawn(event: EarningsWithdrawnEvent): void {
  // Update Creator total earnings
  let creator = getOrCreateCreator(event.params.creator);
  creator.totalEarned = creator.totalEarned.plus(event.params.amount);
  creator.save();

  // Create immutable withdrawal event
  let entity = new EarningsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.creator = creator.id;
  entity.creatorAddress = event.params.creator;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent,
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.admin = event.params.admin;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.oldFee = event.params.oldFee;
  entity.newFee = event.params.newFee;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRateChangeAccepted(event: RateChangeAcceptedEvent): void {
  // Update Stream entity with new rate
  let streamId = event.params.streamId.toString();
  let stream = Stream.load(streamId);
  if (stream != null) {
    stream.ratePerSecond = event.params.newRate;
    stream.ratePerMinute = event.params.newRate.times(BigInt.fromI32(60));
    stream.save();
  }

  // Create immutable event
  let entity = new RateChangeAccepted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.streamId = event.params.streamId;
  entity.oldRate = event.params.oldRate;
  entity.newRate = event.params.newRate;
  entity.settledAmount = event.params.settledAmount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRateChangeCancelled(
  event: RateChangeCancelledEvent,
): void {
  let entity = new RateChangeCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.streamId = event.params.streamId;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRateChangeProposed(event: RateChangeProposedEvent): void {
  let entity = new RateChangeProposed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.streamId = event.params.streamId;
  entity.oldRate = event.params.oldRate;
  entity.newRate = event.params.newRate;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleStreamCreated(event: StreamCreatedEvent): void {
  // Get or create Creator
  let creator = getOrCreateCreator(event.params.receiver);
  creator.activeStreamCount = creator.activeStreamCount + 1;
  creator.totalStreamCount = creator.totalStreamCount + 1;
  addUniqueViewer(creator, event.params.payer);
  creator.save();

  // Create Stream entity
  let streamId = event.params.streamId.toString();
  let stream = new Stream(streamId);
  stream.streamId = event.params.streamId;
  stream.payer = event.params.payer;
  stream.receiver = creator.id;
  stream.ratePerSecond = event.params.ratePerSecond;
  stream.ratePerMinute = event.params.ratePerSecond.times(BigInt.fromI32(60));
  stream.deposit = event.params.maxDeposit;
  stream.startTime = event.params.startTime;
  stream.isActive = true;
  stream.createdAtBlock = event.block.number;
  stream.createdAtTimestamp = event.block.timestamp;
  stream.save();

  // Create immutable StreamCreated event
  let entity = new StreamCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.stream = streamId;
  entity.streamId = event.params.streamId;
  entity.payer = event.params.payer;
  entity.receiver = event.params.receiver;
  entity.ratePerSecond = event.params.ratePerSecond;
  entity.maxDeposit = event.params.maxDeposit;
  entity.startTime = event.params.startTime;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleStreamExtended(event: StreamExtendedEvent): void {
  // Update Stream deposit
  let streamId = event.params.streamId.toString();
  let stream = Stream.load(streamId);
  if (stream != null) {
    stream.deposit = event.params.newTotalDeposit;
    stream.save();
  }

  // Create immutable extension event
  let entity = new StreamExtended(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.stream = streamId;
  entity.streamId = event.params.streamId;
  entity.additionalDeposit = event.params.additionalDeposit;
  entity.newTotalDeposit = event.params.newTotalDeposit;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleStreamStopped(event: StreamStoppedEvent): void {
  let streamId = event.params.streamId.toString();
  let stream = Stream.load(streamId);

  if (stream != null) {
    // Update Stream to inactive
    stream.isActive = false;
    stream.endTime = event.block.timestamp;
    stream.duration = event.params.duration;
    stream.totalPaid = event.params.totalPaid;
    stream.refunded = event.params.refunded;
    stream.stoppedAtBlock = event.block.number;
    stream.stoppedAtTimestamp = event.block.timestamp;
    stream.save();

    // Update Creator active stream count
    let creator = Creator.load(stream.receiver);
    if (creator != null) {
      creator.activeStreamCount = creator.activeStreamCount - 1;
      creator.save();
    }
  }

  // Create immutable stopped event
  let entity = new StreamStopped(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.stream = streamId;
  entity.streamId = event.params.streamId;
  entity.totalPaid = event.params.totalPaid;
  entity.refunded = event.params.refunded;
  entity.duration = event.params.duration;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.admin = event.params.admin;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
