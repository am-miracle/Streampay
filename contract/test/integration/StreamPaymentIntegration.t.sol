// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {StreamPayment} from "../../src/StreamPayment.sol";
import {IStreamPayment} from "../../src/interfaces/IStreamPayment.sol";
import {Errors} from "../../src/libraries/Errors.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {DeployStreamPayment} from "../../script/Deploy.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract StreamPaymentIntegrationTest is Test {
    StreamPayment public streamPayment;
    HelperConfig public helperConfig;
    ERC20Mock public usdc;

    address public owner;
    address public alice;
    address public bob;
    address public creator;
    address public creator2;

    uint256 public constant INITIAL_BALANCE = 1_000_000 * 1e6;
    uint256 public constant PLATFORM_FEE = 10;
    uint256 public constant RATE_0_02_PER_MIN = 333;
    uint256 public constant RATE_0_10_PER_MIN = 1666;
    uint256 public constant RATE_0_05_PER_MIN = 833;

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        creator = makeAddr("creator");
        creator2 = makeAddr("creator2");

        DeployStreamPayment deployer = new DeployStreamPayment();
        (streamPayment, helperConfig) = deployer.run();

        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        usdc = ERC20Mock(config.usdcAddress);

        owner = streamPayment.owner();

        usdc.mint(alice, INITIAL_BALANCE);
        usdc.mint(bob, INITIAL_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                    MULTI-STREAM WORKFLOWS
    //////////////////////////////////////////////////////////////*/

    function test_Integration_CreateMultipleStreams() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * 3);

        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        uint256 stream2 = streamPayment.createStream(
            creator2,
            RATE_0_05_PER_MIN,
            deposit
        );
        uint256 stream3 = streamPayment.createStream(
            creator,
            RATE_0_10_PER_MIN,
            deposit
        );
        vm.stopPrank();

        assertEq(stream1, 0);
        assertEq(stream2, 1);
        assertEq(stream3, 2);
        assertEq(streamPayment.getTotalStreams(), 3);
        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 2);
        assertEq(streamPayment.getCreatorActiveStreamCount(creator2), 1);
    }

    function test_Integration_BatchStopMultipleStreams() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * 3);

        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        uint256 stream2 = streamPayment.createStream(
            creator2,
            RATE_0_05_PER_MIN,
            deposit
        );
        uint256 stream3 = streamPayment.createStream(
            creator,
            RATE_0_10_PER_MIN,
            deposit
        );

        vm.warp(block.timestamp + 60);

        uint256[] memory streamIds = new uint256[](3);
        streamIds[0] = stream1;
        streamIds[1] = stream2;
        streamIds[2] = stream3;

        streamPayment.batchStopStreams(streamIds);
        vm.stopPrank();

        assertFalse(streamPayment.getStream(stream1).isActive);
        assertFalse(streamPayment.getStream(stream2).isActive);
        assertFalse(streamPayment.getStream(stream3).isActive);

        assertTrue(streamPayment.getCreatorEarnings(creator) > 0);
        assertTrue(streamPayment.getCreatorEarnings(creator2) > 0);
        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 0);
        assertEq(streamPayment.getCreatorActiveStreamCount(creator2), 0);
    }

    function test_Integration_CreatorStopsAllTheirStreams() public {
        uint256 deposit = 100_000;

        // Alice creates streams to creator
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * 2);
        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        uint256 stream2 = streamPayment.createStream(
            creator,
            RATE_0_05_PER_MIN,
            deposit
        );
        vm.stopPrank();

        // Bob creates stream to creator
        vm.startPrank(bob);
        usdc.approve(address(streamPayment), deposit);
        uint256 stream3 = streamPayment.createStream(
            creator,
            RATE_0_10_PER_MIN,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 60);

        // Creator batch stops all streams
        vm.startPrank(creator);
        uint256[] memory streamIds = new uint256[](3);
        streamIds[0] = stream1;
        streamIds[1] = stream2;
        streamIds[2] = stream3;

        streamPayment.batchStopStreams(streamIds);
        vm.stopPrank();

        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 0);
    }

    /*//////////////////////////////////////////////////////////////
                    STREAM EXTENSION WORKFLOWS
    //////////////////////////////////////////////////////////////*/

    function test_Integration_ExtendStreamMultipleTimes() public {
        uint256 deposit = 100_000; // MIN_DEPOSIT
        uint256 extension = 50_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit + extension * 3);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );

        vm.warp(block.timestamp + 20);
        streamPayment.extendStream(streamId, extension);

        vm.warp(block.timestamp + 30);
        streamPayment.extendStream(streamId, extension);

        vm.warp(block.timestamp + 40);
        streamPayment.extendStream(streamId, extension);

        vm.stopPrank();

        assertEq(
            streamPayment.getStream(streamId).deposit,
            deposit + extension * 3
        );
        assertTrue(streamPayment.getStream(streamId).isActive);
    }

    function test_Integration_ExtendStreamBeforeDepletion() public {
        uint256 deposit = 100_000; // MIN_DEPOSIT
        uint256 extension = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit + extension);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );

        // Fast forward to near depletion (100,000 / 333 = ~300 seconds)
        vm.warp(block.timestamp + 280);

        uint256 streamed = streamPayment.getStreamedAmount(streamId);
        assertTrue(streamed > 90_000); // Almost depleted

        streamPayment.extendStream(streamId, extension);

        assertTrue(streamPayment.getStream(streamId).isActive);
        assertFalse(streamPayment.isStreamDepleted(streamId));
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    RATE CHANGE WORKFLOWS
    //////////////////////////////////////////////////////////////*/

    function test_Integration_CompleteRateChangeFlow() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 60);

        // Creator proposes new rate
        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);

        uint256 earningsBeforeAccept = streamPayment.getCreatorEarnings(
            creator
        );

        // Alice accepts
        vm.prank(alice);
        streamPayment.acceptRateChange(streamId);

        // Verify rate changed
        assertEq(
            streamPayment.getStream(streamId).ratePerSecond,
            RATE_0_10_PER_MIN
        );

        // Verify settlement occurred
        assertTrue(
            streamPayment.getCreatorEarnings(creator) > earningsBeforeAccept
        );

        // Verify stream continues
        vm.warp(block.timestamp + 30);
        uint256 newStreamed = streamPayment.getStreamedAmount(streamId);
        assertTrue(newStreamed > 0);
    }

    function test_Integration_ExtendAndChangeRate() public {
        uint256 deposit = 100_000; // MIN_DEPOSIT
        uint256 extension = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit + extension);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );

        vm.warp(block.timestamp + 30);

        // Extend stream
        streamPayment.extendStream(streamId, extension);
        vm.stopPrank();

        // Creator proposes rate change
        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);

        // Alice accepts
        vm.prank(alice);
        streamPayment.acceptRateChange(streamId);

        // Verify stream continues with new rate
        assertEq(
            streamPayment.getStream(streamId).ratePerSecond,
            RATE_0_10_PER_MIN
        );
        assertTrue(streamPayment.getStream(streamId).isActive);

        // Continue streaming at new rate
        vm.warp(block.timestamp + 60);
        assertTrue(streamPayment.getStreamedAmount(streamId) > 0);
    }

    function test_Integration_RateChangeRejectionFlow() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        // Creator proposes rate increase
        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);

        // Alice rejects by cancelling
        vm.prank(alice);
        streamPayment.cancelRateChange(streamId);

        // Verify proposal cleared
        assertEq(streamPayment.getProposedRate(streamId), 0);

        // Stream continues at old rate
        assertEq(
            streamPayment.getStream(streamId).ratePerSecond,
            RATE_0_02_PER_MIN
        );
    }

    /*//////////////////////////////////////////////////////////////
                    EARNINGS WORKFLOW
    //////////////////////////////////////////////////////////////*/

    function test_Integration_CreatorEarningsFromMultipleStreams() public {
        uint256 deposit = 100_000;

        // Alice creates stream
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        // Bob creates stream
        vm.startPrank(bob);
        usdc.approve(address(streamPayment), deposit);
        uint256 stream2 = streamPayment.createStream(
            creator,
            RATE_0_10_PER_MIN,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 60);

        // Stop both streams
        vm.prank(alice);
        streamPayment.stopStream(stream1);

        vm.prank(bob);
        streamPayment.stopStream(stream2);

        uint256 totalEarnings = streamPayment.getCreatorEarnings(creator);
        assertTrue(totalEarnings > 0);

        // Creator withdraws
        vm.prank(creator);
        streamPayment.withdrawEarnings();

        assertEq(usdc.balanceOf(creator), totalEarnings);
        assertEq(streamPayment.getCreatorEarnings(creator), 0);
    }

    function test_Integration_CreatorWithdrawsWhileStreamsActive() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * 2);

        // Create first stream and stop it
        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.warp(block.timestamp + 60);
        streamPayment.stopStream(stream1);

        uint256 firstEarnings = streamPayment.getCreatorEarnings(creator);

        // Create second stream (keep active)
        uint256 stream2 = streamPayment.createStream(
            creator,
            RATE_0_10_PER_MIN,
            deposit
        );
        vm.stopPrank();

        // Creator withdraws first stream earnings
        vm.prank(creator);
        streamPayment.withdrawEarnings();

        assertEq(usdc.balanceOf(creator), firstEarnings);
        assertEq(streamPayment.getCreatorEarnings(creator), 0);

        // Second stream still active
        assertTrue(streamPayment.getStream(stream2).isActive);
        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 1);
    }

    /*//////////////////////////////////////////////////////////////
                    COMPLEX SCENARIOS
    //////////////////////////////////////////////////////////////*/

    function test_Integration_StopStreamClearsPendingRateChange() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);

        assertTrue(streamPayment.getProposedRate(streamId) > 0);

        vm.prank(alice);
        streamPayment.stopStream(streamId);

        assertEq(streamPayment.getProposedRate(streamId), 0);
    }

    function test_Integration_PlatformFeesAccumulation() public {
        uint256 deposit = 100_000;

        // Alice creates stream
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 stream1 = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.warp(block.timestamp + 60);
        streamPayment.stopStream(stream1);
        vm.stopPrank();

        uint256 feesAfterFirst = streamPayment.platformEarnings();
        assertTrue(feesAfterFirst > 0);

        // Bob creates stream
        vm.startPrank(bob);
        usdc.approve(address(streamPayment), deposit);
        uint256 stream2 = streamPayment.createStream(
            creator2,
            RATE_0_10_PER_MIN,
            deposit
        );
        vm.warp(block.timestamp + 60);
        streamPayment.stopStream(stream2);
        vm.stopPrank();

        uint256 feesAfterSecond = streamPayment.platformEarnings();
        assertTrue(feesAfterSecond > feesAfterFirst);

        // Owner withdraws all fees
        vm.prank(owner);
        streamPayment.withdrawPlatformFees();

        assertEq(usdc.balanceOf(owner), feesAfterSecond);
        assertEq(streamPayment.platformEarnings(), 0);
    }

    function test_Integration_PauseAffectsOnlyNewOperations() public {
        uint256 deposit = 100_000;

        // Create stream before pause
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * 2);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        // Owner pauses
        vm.prank(owner);
        streamPayment.pause();

        // Cannot create new stream
        vm.startPrank(alice);
        vm.expectRevert(Errors.ContractPaused.selector);
        streamPayment.createStream(creator, RATE_0_02_PER_MIN, deposit);

        // Cannot stop existing stream
        vm.expectRevert(Errors.ContractPaused.selector);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        // Unpause
        vm.prank(owner);
        streamPayment.unpause();

        // Now can stop
        vm.prank(alice);
        streamPayment.stopStream(streamId);

        assertFalse(streamPayment.getStream(streamId).isActive);
    }

    function test_Integration_DepletedStreamBehavior() public {
        uint256 deposit = 100_000; // MIN_DEPOSIT

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        // Fast forward beyond depletion (100,000 / 333 = ~300 seconds)
        vm.warp(block.timestamp + 400);

        // Check depletion
        assertTrue(streamPayment.isStreamDepleted(streamId));

        // Streamed amount capped at deposit
        assertEq(streamPayment.getStreamedAmount(streamId), deposit);

        // Stream still marked as active
        assertTrue(streamPayment.getStream(streamId).isActive);

        // Stop stream
        vm.prank(alice);
        streamPayment.stopStream(streamId);

        // Verify creator received full deposit (minus fees)
        uint256 expectedFee = (deposit * PLATFORM_FEE) / 10_000;
        uint256 expectedCreatorAmount = deposit - expectedFee;

        assertEq(
            streamPayment.getCreatorEarnings(creator),
            expectedCreatorAmount
        );

        // No refund to payer
        assertEq(usdc.balanceOf(alice), INITIAL_BALANCE - deposit);
    }

    /*//////////////////////////////////////////////////////////////
                    STRESS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Integration_ManyStreamsToOneCreator() public {
        uint256 numStreams = 10;
        uint256 deposit = 100_000; // MIN_DEPOSIT

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * numStreams);

        uint256[] memory streamIds = new uint256[](numStreams);
        for (uint256 i = 0; i < numStreams; i++) {
            streamIds[i] = streamPayment.createStream(
                creator,
                RATE_0_02_PER_MIN,
                deposit
            );
        }

        assertEq(
            streamPayment.getCreatorActiveStreamCount(creator),
            numStreams
        );

        vm.warp(block.timestamp + 60);

        // Batch stop all
        streamPayment.batchStopStreams(streamIds);
        vm.stopPrank();

        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 0);
        assertTrue(streamPayment.getCreatorEarnings(creator) > 0);
    }
}
