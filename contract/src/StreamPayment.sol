// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IStreamPayment} from "./interfaces/IStreamPayment.sol";
import {Errors} from "./libraries/Errors.sol";

/**
 * @notice gasless micropayment streaming infrastructure for pay-per-second content
 */
contract StreamPayment is IStreamPayment, ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    uint256 public constant MIN_DEPOSIT = 100_000; // $0.10
    uint256 public constant MAX_DEPOSIT = 100_000_000; // $100
    uint256 public constant MAX_PLATFORM_FEE = 100; // 1%
    uint256 private constant BP_DIVISOR = 10_000;

    IERC20 public immutable usdcToken;

    uint256 public platformFee; // 0.1% = 10 bp
    uint256 public platformEarnings;

    bool private _paused;
    uint256 private _streamIdCounter;

    mapping(uint256 => Stream) private _streams;
    mapping(address => uint256) private _creatorEarnings;
    mapping(address => uint256) private _creatorTotalEarned;
    mapping(address => uint256) private _creatorActiveStreams;
    mapping(uint256 => uint256) private _proposedRates;

    modifier whenNotPaused() {
        if (_paused) revert Errors.ContractPaused();
        _;
    }

    modifier whenPaused() {
        if (!_paused) revert Errors.ContractNotPaused();
        _;
    }

    constructor(address usdcAddress, uint256 initialFee) Ownable(msg.sender) {
        if (usdcAddress == address(0)) revert Errors.ZeroAddress();
        if (initialFee > MAX_PLATFORM_FEE) revert Errors.InvalidFee();

        usdcToken = IERC20(usdcAddress);
        platformFee = initialFee;

        emit PlatformFeeUpdated(0, initialFee);
    }

    /*//////////////////////////////////////////////////////////////
                            CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createStream(
        address receiver,
        uint256 ratePerSecond,
        uint256 maxDeposit
    ) external override nonReentrant whenNotPaused returns (uint256 streamId) {
        if (receiver == address(0)) revert Errors.InvalidReceiver();
        if (ratePerSecond == 0) revert Errors.InvalidRate();
        if (maxDeposit < MIN_DEPOSIT) revert Errors.DepositTooLow();
        if (maxDeposit > MAX_DEPOSIT) revert Errors.DepositTooHigh();

        streamId = _streamIdCounter++;
        uint256 startTime = block.timestamp;

        _streams[streamId] = Stream({
            payer: msg.sender,
            receiver: receiver,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            deposit: maxDeposit,
            isActive: true
        });

        _creatorActiveStreams[receiver]++;

        usdcToken.safeTransferFrom(msg.sender, address(this), maxDeposit);

        emit StreamCreated(
            streamId,
            msg.sender,
            receiver,
            ratePerSecond,
            maxDeposit,
            startTime
        );
    }

    function stopStream(
        uint256 streamId
    ) external override nonReentrant whenNotPaused {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (msg.sender != stream.payer && msg.sender != stream.receiver) {
            revert Errors.OnlyPayerOrReceiver();
        }

        _stopStreamInternal(streamId);
    }

    function withdrawEarnings() external override nonReentrant {
        uint256 earnings = _creatorEarnings[msg.sender];

        if (earnings == 0) revert Errors.NoEarningsToWithdraw();

        _creatorEarnings[msg.sender] = 0;

        usdcToken.safeTransfer(msg.sender, earnings);

        emit EarningsWithdrawn(msg.sender, earnings);
    }

    function batchStopStreams(
        uint256[] calldata streamIds
    ) external override nonReentrant whenNotPaused {
        for (uint256 i = 0; i < streamIds.length; i++) {
            _stopStreamInternal(streamIds[i]);
        }
    }

    function extendStream(
        uint256 streamId,
        uint256 additionalDeposit
    ) external override nonReentrant whenNotPaused {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (msg.sender != stream.payer) revert Errors.Unauthorized();
        if (additionalDeposit == 0) revert Errors.NothingToExtend();

        uint256 newTotalDeposit = stream.deposit + additionalDeposit;
        if (newTotalDeposit > MAX_DEPOSIT) revert Errors.DepositExceedsMax();

        stream.deposit = newTotalDeposit;

        usdcToken.safeTransferFrom(
            msg.sender,
            address(this),
            additionalDeposit
        );

        emit StreamExtended(streamId, additionalDeposit, newTotalDeposit);
    }

    function proposeRateChange(
        uint256 streamId,
        uint256 newRate
    ) external override whenNotPaused {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (msg.sender != stream.receiver) revert Errors.Unauthorized();
        if (newRate == 0) revert Errors.InvalidRate();
        if (newRate == stream.ratePerSecond) revert Errors.InvalidRateChange();

        _proposedRates[streamId] = newRate;

        emit RateChangeProposed(streamId, stream.ratePerSecond, newRate);
    }

    function acceptRateChange(
        uint256 streamId
    ) external override nonReentrant whenNotPaused {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (msg.sender != stream.payer) revert Errors.Unauthorized();

        uint256 proposedRate = _proposedRates[streamId];
        if (proposedRate == 0) revert Errors.RateChangeNotProposed();

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalOwed = elapsed * stream.ratePerSecond;

        if (totalOwed > stream.deposit) {
            totalOwed = stream.deposit;
        }

        uint256 feeAmount = (totalOwed * platformFee) / BP_DIVISOR;
        uint256 creatorAmount = totalOwed - feeAmount;

        _creatorEarnings[stream.receiver] += creatorAmount;
        _creatorTotalEarned[stream.receiver] += creatorAmount;
        platformEarnings += feeAmount;

        uint256 oldRate = stream.ratePerSecond;
        stream.ratePerSecond = proposedRate;
        stream.deposit -= totalOwed;
        stream.startTime = block.timestamp;

        delete _proposedRates[streamId];

        emit RateChangeAccepted(streamId, oldRate, proposedRate, creatorAmount);
    }

    function cancelRateChange(
        uint256 streamId
    ) external override whenNotPaused {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (msg.sender != stream.payer && msg.sender != stream.receiver) {
            revert Errors.UnauthorizedRateChange();
        }

        if (_proposedRates[streamId] == 0)
            revert Errors.RateChangeNotProposed();

        delete _proposedRates[streamId];

        emit RateChangeCancelled(streamId);
    }

    function _stopStreamInternal(uint256 streamId) private {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) revert Errors.StreamNotActive();
        if (
            msg.sender != stream.payer &&
            msg.sender != stream.receiver &&
            msg.sender != address(this)
        ) {
            revert Errors.OnlyPayerOrReceiver();
        }

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalOwed = elapsed * stream.ratePerSecond;

        if (totalOwed > stream.deposit) {
            totalOwed = stream.deposit;
        }

        uint256 feeAmount = (totalOwed * platformFee) / BP_DIVISOR;
        uint256 creatorAmount = totalOwed - feeAmount;
        uint256 refundAmount = stream.deposit - totalOwed;

        stream.isActive = false;
        _creatorEarnings[stream.receiver] += creatorAmount;
        _creatorTotalEarned[stream.receiver] += creatorAmount;
        _creatorActiveStreams[stream.receiver]--;
        platformEarnings += feeAmount;

        if (_proposedRates[streamId] != 0) {
            delete _proposedRates[streamId];
        }

        if (refundAmount > 0) {
            usdcToken.safeTransfer(stream.payer, refundAmount);
        }

        emit StreamStopped(streamId, creatorAmount, refundAmount, elapsed);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getStreamedAmount(
        uint256 streamId
    ) external view override returns (uint256) {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) return 0;

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalOwed = elapsed * stream.ratePerSecond;

        return totalOwed > stream.deposit ? stream.deposit : totalOwed;
    }

    function getStream(
        uint256 streamId
    ) external view override returns (Stream memory) {
        return _streams[streamId];
    }

    function getCreatorEarnings(
        address creator
    ) external view override returns (uint256) {
        return _creatorEarnings[creator];
    }

    function getTotalStreams() external view override returns (uint256) {
        return _streamIdCounter;
    }

    function paused() external view override returns (bool) {
        return _paused;
    }

    function getCreatorTotalEarned(
        address creator
    ) external view returns (uint256) {
        return _creatorTotalEarned[creator];
    }

    function getCreatorActiveStreamCount(
        address creator
    ) external view returns (uint256) {
        return _creatorActiveStreams[creator];
    }

    function isStreamDepleted(
        uint256 streamId
    ) external view override returns (bool) {
        Stream storage stream = _streams[streamId];

        if (!stream.isActive) return false;

        uint256 elapsed = block.timestamp - stream.startTime;
        uint256 totalOwed = elapsed * stream.ratePerSecond;

        return totalOwed >= stream.deposit;
    }

    function getProposedRate(
        uint256 streamId
    ) external view override returns (uint256) {
        return _proposedRates[streamId];
    }

    function pause() external onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_PLATFORM_FEE) revert Errors.InvalidFee();

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 earnings = platformEarnings;

        if (earnings == 0) revert Errors.NoEarningsToWithdraw();

        platformEarnings = 0;
        usdcToken.safeTransfer(owner(), earnings);
    }
}
