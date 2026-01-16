// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * Example: $0.02/minute = (0.02 * 1e6) / 60 = 333 wei/second
 */
interface IStreamPayment {
    event StreamCreated(
        uint256 indexed streamId,
        address indexed payer,
        address indexed receiver,
        uint256 ratePerSecond,
        uint256 maxDeposit,
        uint256 startTime
    );

    event StreamStopped(
        uint256 indexed streamId,
        uint256 totalPaid,
        uint256 refunded,
        uint256 duration
    );

    event EarningsWithdrawn(address indexed creator, uint256 amount);

    event Paused(address indexed admin);

    event Unpaused(address indexed admin);

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    event StreamExtended(
        uint256 indexed streamId,
        uint256 additionalDeposit,
        uint256 newTotalDeposit
    );

    event RateChangeProposed(
        uint256 indexed streamId,
        uint256 oldRate,
        uint256 newRate
    );

    event RateChangeAccepted(
        uint256 indexed streamId,
        uint256 oldRate,
        uint256 newRate,
        uint256 settledAmount
    );

    event RateChangeCancelled(uint256 indexed streamId);

    struct Stream {
        address payer; // address paying for the stream
        address receiver; // address receiving payment
        uint256 ratePerSecond; // payment rate in wei per second
        uint256 startTime;
        uint256 deposit;
        bool isActive; // whether stream is currently active
    }

    /**
     * @notice Creates a new payment stream
     * @param receiver address to receive payments
     * @param ratePerSecond payment rate in wei per second (must be > 0)
     * @param maxDeposit amount to deposit upfront (must be between MIN_DEPOSIT and MAX_DEPOSIT)
     * @return streamId unique identifier for the created stream
     * @dev Requires prior USDC approval. Payer must approve this contract to spend maxDeposit
     */
    function createStream(
        address receiver,
        uint256 ratePerSecond,
        uint256 maxDeposit
    ) external returns (uint256 streamId);

    /**
     * @notice This stops an active payment stream and settles payment
     * @param streamId Unique identifier of the stream to stop
     * @dev Only callable by stream payer or receiver
     * @dev Calculates owed amount as min(elapsed * rate, deposit)
     * @dev transfers owed amount to receiver, refunds excess to payer
     */
    function stopStream(uint256 streamId) external;

    /**
     * @notice withdraws accumulated earnings for a creator
     * @dev only withdraws caller's own earnings
     */
    function withdrawEarnings() external;

    /**
     * @notice This function xalculates current streamed amount without stopping stream
     * @param streamId Unique identifier of the stream
     * @return amount Current owed amount in wei
     * @dev Returns min(elapsed * rate, deposit) to prevent overflow
     */
    function getStreamedAmount(
        uint256 streamId
    ) external view returns (uint256 amount);

    /**
     * @notice This function gets complete stream information
     * @param streamId Unique identifier of the stream
     * @return stream Complete Stream struct
     */
    function getStream(
        uint256 streamId
    ) external view returns (Stream memory stream);

    /**
     * @notice This function gets total historical earnings for a creator (including withdrawn)
     * @param creator Address to check
     * @return earnings Total earned across all time
     */
    function getCreatorEarnings(
        address creator
    ) external view returns (uint256 earnings);

    function getTotalStreams() external view returns (uint256);

    /**
     * @notice This function get active stream count for a creator
     * @param creator Address to check
     * @return Number of currently active streams
     */
    function getCreatorActiveStreamCount(
        address creator
    ) external view returns (uint256);

    function paused() external view returns (bool);

    /**
     * @notice This function stops multiple streams in a single transaction
     * @param streamIds Array of stream IDs to stop
     * @dev Only callable by payer or receiver of each stream
     */
    function batchStopStreams(uint256[] calldata streamIds) external;

    /**
     * @notice This function extends an active stream by adding more deposit
     * @param streamId Unique identifier of the stream to extend
     * @param additionalDeposit Amount of tokens to add to the stream
     * Only callable by stream payer
     * New total deposit cannot exceed MAX_DEPOSIT
     */
    function extendStream(uint256 streamId, uint256 additionalDeposit) external;

    /**
     * @notice this function proposes a rate change for an active stream
     * @param streamId Unique identifier of the stream
     * @param newRate New rate per second in wei
     * Only callable by stream receiver (creator)
     * Requires payer approval via acceptRateChange
     */
    function proposeRateChange(uint256 streamId, uint256 newRate) external;

    /**
     * @notice This function Accepts a proposed rate change
     * @param streamId Unique identifier of the stream
     * @dev Only callable by stream payer
     * @dev Settles stream at old rate, then restarts at new rate
     */
    function acceptRateChange(uint256 streamId) external;

    /**
     * @notice Cancels a proposed rate change
     * @param streamId Unique identifier of the stream
     */
    function cancelRateChange(uint256 streamId) external;

    /**
     * @notice Checks if a stream has depleted its deposit
     * @param streamId Unique identifier of the stream
     * @return True if stream is active but deposit is fully consumed
     */
    function isStreamDepleted(uint256 streamId) external view returns (bool);

    /**
     * @notice Gets the proposed rate for a stream
     * @param streamId Unique identifier of the stream
     * @return Proposed rate per second (0 if no proposal)
     */
    function getProposedRate(uint256 streamId) external view returns (uint256);
}
