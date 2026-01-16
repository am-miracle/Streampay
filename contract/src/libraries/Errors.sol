// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library Errors {
    error Unauthorized();
    error OnlyPayerOrReceiver();

    error InvalidReceiver();
    error InvalidRate();
    error InvalidDeposit();
    error StreamNotActive();
    error StreamAlreadyActive();
    error StreamNotFound();

    error DepositTooLow();
    error DepositTooHigh();

    error NoEarningsToWithdraw();
    error WithdrawalFailed();

    error TransferFailed();
    error InsufficientBalance();

    error ContractPaused();
    error ContractNotPaused();

    error InvalidFee();

    error ZeroAddress();

    error StreamDepleted();
    error StreamTooShort();
    error DepositExceedsMax();
    error NothingToExtend();
    error InvalidRateChange();
    error RateChangeNotProposed();
    error UnauthorizedRateChange();
}
