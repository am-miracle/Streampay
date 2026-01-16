// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {StreamPayment} from "../../src/StreamPayment.sol";
import {IStreamPayment} from "../../src/interfaces/IStreamPayment.sol";
import {Errors} from "../../src/libraries/Errors.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {DeployStreamPayment} from "../../script/Deploy.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract StreamPaymentTest is Test {
    StreamPayment public streamPayment;
    HelperConfig public helperConfig;
    ERC20Mock public usdc;

    address public owner;
    address public alice;
    address public bob;
    address public creator;

    uint256 public constant INITIAL_BALANCE = 1_000_000 * 1e6;
    uint256 public constant PLATFORM_FEE = 10;
    uint256 public constant RATE_0_02_PER_MIN = 333;
    uint256 public constant RATE_0_10_PER_MIN = 1666;

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

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        creator = makeAddr("creator");

        DeployStreamPayment deployer = new DeployStreamPayment();
        (streamPayment, helperConfig) = deployer.run();

        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        usdc = ERC20Mock(config.usdcAddress);

        owner = streamPayment.owner();

        usdc.mint(alice, INITIAL_BALANCE);
        usdc.mint(bob, INITIAL_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Constructor_Success() public view {
        assertEq(address(streamPayment.usdcToken()), address(usdc));
        assertEq(streamPayment.platformFee(), PLATFORM_FEE);
        assertEq(streamPayment.owner(), owner);
        assertFalse(streamPayment.paused());
    }

    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new StreamPayment(address(0), PLATFORM_FEE);
    }

    function test_Constructor_RevertsOnInvalidFee() public {
        vm.expectRevert(Errors.InvalidFee.selector);
        new StreamPayment(address(usdc), 101);
    }

    /*//////////////////////////////////////////////////////////////
                        CREATE STREAM TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateStream_Success() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        assertEq(streamId, 0);

        IStreamPayment.Stream memory stream = streamPayment.getStream(streamId);
        assertEq(stream.payer, alice);
        assertEq(stream.receiver, creator);
        assertEq(stream.ratePerSecond, RATE_0_02_PER_MIN);
        assertEq(stream.deposit, deposit);
        assertTrue(stream.isActive);
    }

    function test_CreateStream_RevertsOnZeroReceiver() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);

        vm.expectRevert(Errors.InvalidReceiver.selector);
        streamPayment.createStream(address(0), RATE_0_02_PER_MIN, 100_000);
        vm.stopPrank();
    }

    function test_CreateStream_RevertsOnZeroRate() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);

        vm.expectRevert(Errors.InvalidRate.selector);
        streamPayment.createStream(creator, 0, 100_000);
        vm.stopPrank();
    }

    function test_CreateStream_RevertsOnDepositTooLow() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 99_999);

        vm.expectRevert(Errors.DepositTooLow.selector);
        streamPayment.createStream(creator, RATE_0_02_PER_MIN, 99_999);
        vm.stopPrank();
    }

    function test_CreateStream_RevertsOnDepositTooHigh() public {
        uint256 tooHigh = streamPayment.MAX_DEPOSIT() + 1;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), tooHigh);

        vm.expectRevert(Errors.DepositTooHigh.selector);
        streamPayment.createStream(creator, RATE_0_02_PER_MIN, tooHigh);
        vm.stopPrank();
    }

    function test_CreateStream_RevertsWhenPaused() public {
        vm.prank(owner);
        streamPayment.pause();

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);

        vm.expectRevert(Errors.ContractPaused.selector);
        streamPayment.createStream(creator, RATE_0_02_PER_MIN, 100_000);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        STOP STREAM TESTS
    //////////////////////////////////////////////////////////////*/

    function test_StopStream_ByPayer_Success() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );

        vm.warp(block.timestamp + 60);

        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 totalOwed = 60 * RATE_0_02_PER_MIN;
        uint256 feeAmount = (totalOwed * PLATFORM_FEE) / 10_000;
        uint256 creatorAmount = totalOwed - feeAmount;
        uint256 refundAmount = deposit - totalOwed;

        assertEq(streamPayment.getCreatorEarnings(creator), creatorAmount);
        assertEq(usdc.balanceOf(alice) - aliceBalanceBefore, refundAmount);
        assertFalse(streamPayment.getStream(streamId).isActive);
    }

    function test_StopStream_ByReceiver_Success() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 30);

        vm.prank(creator);
        streamPayment.stopStream(streamId);

        assertFalse(streamPayment.getStream(streamId).isActive);
    }

    function test_StopStream_RevertsOnUnauthorized() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert(Errors.OnlyPayerOrReceiver.selector);
        streamPayment.stopStream(streamId);
    }

    function test_StopStream_RevertsOnInactiveStream() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );

        streamPayment.stopStream(streamId);

        vm.expectRevert(Errors.StreamNotActive.selector);
        streamPayment.stopStream(streamId);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    WITHDRAW EARNINGS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_WithdrawEarnings_Success() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.warp(block.timestamp + 60);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 earnings = streamPayment.getCreatorEarnings(creator);
        assertTrue(earnings > 0);

        vm.prank(creator);
        streamPayment.withdrawEarnings();

        assertEq(usdc.balanceOf(creator), earnings);
        assertEq(streamPayment.getCreatorEarnings(creator), 0);
    }

    function test_WithdrawEarnings_RevertsOnZeroEarnings() public {
        vm.prank(creator);
        vm.expectRevert(Errors.NoEarningsToWithdraw.selector);
        streamPayment.withdrawEarnings();
    }

    /*//////////////////////////////////////////////////////////////
                        EXTEND STREAM TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ExtendStream_Success() public {
        uint256 deposit = 100_000;
        uint256 extension = 50_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit + extension);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );

        streamPayment.extendStream(streamId, extension);
        vm.stopPrank();

        assertEq(
            streamPayment.getStream(streamId).deposit,
            deposit + extension
        );
    }

    function test_ExtendStream_RevertsOnInactiveStream() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 200_000);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );

        streamPayment.stopStream(streamId);

        vm.expectRevert(Errors.StreamNotActive.selector);
        streamPayment.extendStream(streamId, 50_000);
        vm.stopPrank();
    }

    function test_ExtendStream_RevertsOnUnauthorized() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.startPrank(bob);
        usdc.approve(address(streamPayment), 50_000);

        vm.expectRevert(Errors.Unauthorized.selector);
        streamPayment.extendStream(streamId, 50_000);
        vm.stopPrank();
    }

    function test_ExtendStream_RevertsOnZeroAmount() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );

        vm.expectRevert(Errors.NothingToExtend.selector);
        streamPayment.extendStream(streamId, 0);
        vm.stopPrank();
    }

    function test_ExtendStream_RevertsOnExceedingMaxDeposit() public {
        uint256 maxDeposit = streamPayment.MAX_DEPOSIT();

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), maxDeposit + 1);

        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            maxDeposit
        );

        vm.expectRevert(Errors.DepositExceedsMax.selector);
        streamPayment.extendStream(streamId, 1);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        RATE CHANGE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ProposeRateChange_Success() public {
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

        assertEq(streamPayment.getProposedRate(streamId), RATE_0_10_PER_MIN);
    }

    function test_ProposeRateChange_RevertsOnUnauthorized() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert(Errors.Unauthorized.selector);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);
    }

    function test_ProposeRateChange_RevertsOnSameRate() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.prank(creator);
        vm.expectRevert(Errors.InvalidRateChange.selector);
        streamPayment.proposeRateChange(streamId, RATE_0_02_PER_MIN);
    }

    function test_AcceptRateChange_Success() public {
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

        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, RATE_0_10_PER_MIN);

        vm.prank(alice);
        streamPayment.acceptRateChange(streamId);

        assertEq(
            streamPayment.getStream(streamId).ratePerSecond,
            RATE_0_10_PER_MIN
        );
        assertEq(streamPayment.getProposedRate(streamId), 0);
    }

    function test_AcceptRateChange_RevertsOnUnauthorized() public {
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

        vm.prank(bob);
        vm.expectRevert(Errors.Unauthorized.selector);
        streamPayment.acceptRateChange(streamId);
    }

    function test_AcceptRateChange_RevertsOnNoProposal() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );

        vm.expectRevert(Errors.RateChangeNotProposed.selector);
        streamPayment.acceptRateChange(streamId);
        vm.stopPrank();
    }

    function test_CancelRateChange_Success() public {
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

        vm.prank(alice);
        streamPayment.cancelRateChange(streamId);

        assertEq(streamPayment.getProposedRate(streamId), 0);
    }

    /*//////////////////////////////////////////////////////////////
                        BATCH OPERATIONS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_BatchStopStreams_EmptyArray() public {
        uint256[] memory streamIds = new uint256[](0);

        vm.prank(alice);
        streamPayment.batchStopStreams(streamIds);
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLETION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_IsStreamDepleted_NotDepleted() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 60);

        assertFalse(streamPayment.isStreamDepleted(streamId));
    }

    function test_IsStreamDepleted_Depleted() public {
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

        assertTrue(streamPayment.isStreamDepleted(streamId));
    }

    function test_IsStreamDepleted_InactiveStream() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        assertFalse(streamPayment.isStreamDepleted(streamId));
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Pause_Success() public {
        vm.prank(owner);
        streamPayment.pause();

        assertTrue(streamPayment.paused());
    }

    function test_Pause_RevertsOnNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        streamPayment.pause();
    }

    function test_Unpause_Success() public {
        vm.startPrank(owner);
        streamPayment.pause();
        streamPayment.unpause();
        vm.stopPrank();

        assertFalse(streamPayment.paused());
    }

    function test_UpdatePlatformFee_Success() public {
        vm.prank(owner);
        streamPayment.updatePlatformFee(50);

        assertEq(streamPayment.platformFee(), 50);
    }

    function test_UpdatePlatformFee_RevertsOnInvalidFee() public {
        vm.prank(owner);
        vm.expectRevert(Errors.InvalidFee.selector);
        streamPayment.updatePlatformFee(101);
    }

    function test_WithdrawPlatformFees_Success() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        vm.warp(block.timestamp + 60);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 platformFees = streamPayment.platformEarnings();
        assertTrue(platformFees > 0);

        vm.prank(owner);
        streamPayment.withdrawPlatformFees();

        assertEq(usdc.balanceOf(owner), platformFees);
        assertEq(streamPayment.platformEarnings(), 0);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetStreamedAmount_Active() public {
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

        uint256 streamed = streamPayment.getStreamedAmount(streamId);
        assertEq(streamed, 60 * RATE_0_02_PER_MIN);
    }

    function test_GetStreamedAmount_CappedAtDeposit() public {
        uint256 deposit = 100_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 10_000);

        uint256 streamed = streamPayment.getStreamedAmount(streamId);
        assertEq(streamed, deposit);
    }

    function test_GetStreamedAmount_Inactive() public {
        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 100_000);
        uint256 streamId = streamPayment.createStream(
            creator,
            RATE_0_02_PER_MIN,
            100_000
        );
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        assertEq(streamPayment.getStreamedAmount(streamId), 0);
    }
}
