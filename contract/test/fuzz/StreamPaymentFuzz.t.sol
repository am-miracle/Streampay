// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {StreamPayment} from "../../src/StreamPayment.sol";
import {IStreamPayment} from "../../src/interfaces/IStreamPayment.sol";
import {Errors} from "../../src/libraries/Errors.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {DeployStreamPayment} from "../../script/Deploy.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract StreamPaymentFuzzTest is Test {
    StreamPayment public streamPayment;
    HelperConfig public helperConfig;
    ERC20Mock public usdc;

    address public owner;
    address public alice;
    address public bob;
    address public creator;

    uint256 public constant INITIAL_BALANCE = 1_000_000_000 * 1e6; // $1B USDC for fuzz tests
    uint256 public constant PLATFORM_FEE = 10;

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
                    CREATE STREAM FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_CreateStream_ValidInputs(
        uint256 rate,
        uint256 deposit
    ) public {
        // Bound inputs to valid ranges
        rate = bound(rate, 1, 1_000_000); // 1 wei/sec to 1 USDC/sec
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        uint256 streamId = streamPayment.createStream(creator, rate, deposit);
        vm.stopPrank();

        IStreamPayment.Stream memory stream = streamPayment.getStream(streamId);
        assertEq(stream.ratePerSecond, rate);
        assertEq(stream.deposit, deposit);
        assertEq(stream.payer, alice);
        assertEq(stream.receiver, creator);
        assertTrue(stream.isActive);
    }

    function testFuzz_CreateStream_InvalidRate(uint256 deposit) public {
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        vm.expectRevert(Errors.InvalidRate.selector);
        streamPayment.createStream(creator, 0, deposit);
        vm.stopPrank();
    }

    function testFuzz_CreateStream_DepositTooLow(uint256 deposit) public {
        deposit = bound(deposit, 1, streamPayment.MIN_DEPOSIT() - 1);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        vm.expectRevert(Errors.DepositTooLow.selector);
        streamPayment.createStream(creator, 100, deposit);
        vm.stopPrank();
    }

    function testFuzz_CreateStream_DepositTooHigh(uint256 deposit) public {
        deposit = bound(
            deposit,
            streamPayment.MAX_DEPOSIT() + 1,
            type(uint128).max
        );

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        vm.expectRevert(Errors.DepositTooHigh.selector);
        streamPayment.createStream(creator, 100, deposit);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    STOP STREAM FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_StopStream_VariousDurations(uint256 duration) public {
        duration = bound(duration, 0, 10_000); // 0 to ~2.7 hours
        uint256 deposit = 10_000_000; // Large deposit
        uint256 rate = 333;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);

        vm.warp(block.timestamp + duration);

        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 expectedOwed = duration * rate;
        if (expectedOwed > deposit) expectedOwed = deposit;

        uint256 expectedFee = (expectedOwed * PLATFORM_FEE) / 10_000;
        uint256 expectedCreatorAmount = expectedOwed - expectedFee;
        uint256 expectedRefund = deposit - expectedOwed;

        assertEq(
            streamPayment.getCreatorEarnings(creator),
            expectedCreatorAmount
        );
        assertEq(usdc.balanceOf(alice) - aliceBalanceBefore, expectedRefund);
        assertFalse(streamPayment.getStream(streamId).isActive);
    }

    function testFuzz_StopStream_VaryingRatesAndDeposits(
        uint256 rate,
        uint256 deposit,
        uint256 duration
    ) public {
        rate = bound(rate, 1, 10_000);
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );
        duration = bound(duration, 0, 1_000);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);

        vm.warp(block.timestamp + duration);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 expectedOwed = duration * rate;
        if (expectedOwed > deposit) expectedOwed = deposit;

        uint256 expectedFee = (expectedOwed * PLATFORM_FEE) / 10_000;
        uint256 expectedCreatorAmount = expectedOwed - expectedFee;

        // Allow small rounding differences
        assertApproxEqAbs(
            streamPayment.getCreatorEarnings(creator),
            expectedCreatorAmount,
            1
        );
    }

    /*//////////////////////////////////////////////////////////////
                    EXTEND STREAM FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_ExtendStream_ValidAmounts(
        uint256 initialDeposit,
        uint256 extension
    ) public {
        initialDeposit = bound(
            initialDeposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT() / 2
        );
        extension = bound(
            extension,
            1,
            streamPayment.MAX_DEPOSIT() - initialDeposit
        );

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), initialDeposit + extension);

        uint256 streamId = streamPayment.createStream(
            creator,
            333,
            initialDeposit
        );

        streamPayment.extendStream(streamId, extension);
        vm.stopPrank();

        assertEq(
            streamPayment.getStream(streamId).deposit,
            initialDeposit + extension
        );
    }

    function testFuzz_ExtendStream_ExceedingMaxDeposit(
        uint256 initialDeposit,
        uint256 extension
    ) public {
        initialDeposit = bound(
            initialDeposit,
            streamPayment.MAX_DEPOSIT() / 2,
            streamPayment.MAX_DEPOSIT()
        );
        extension = bound(
            extension,
            streamPayment.MAX_DEPOSIT() - initialDeposit + 1,
            type(uint128).max
        );

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), initialDeposit + extension);

        uint256 streamId = streamPayment.createStream(
            creator,
            333,
            initialDeposit
        );

        vm.expectRevert(Errors.DepositExceedsMax.selector);
        streamPayment.extendStream(streamId, extension);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    RATE CHANGE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_RateChange_ValidRates(
        uint256 initialRate,
        uint256 newRate
    ) public {
        initialRate = bound(initialRate, 1, 10_000);
        newRate = bound(newRate, 1, 10_000);
        vm.assume(initialRate != newRate);

        uint256 deposit = 1_000_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            initialRate,
            deposit
        );
        vm.stopPrank();

        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, newRate);

        assertEq(streamPayment.getProposedRate(streamId), newRate);

        vm.prank(alice);
        streamPayment.acceptRateChange(streamId);

        assertEq(streamPayment.getStream(streamId).ratePerSecond, newRate);
    }

    function testFuzz_RateChange_WithDuration(
        uint256 initialRate,
        uint256 newRate,
        uint256 duration
    ) public {
        initialRate = bound(initialRate, 100, 5_000);
        newRate = bound(newRate, 100, 5_000);
        duration = bound(duration, 1, 500);
        vm.assume(initialRate != newRate);

        uint256 deposit = 10_000_000;

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(
            creator,
            initialRate,
            deposit
        );
        vm.stopPrank();

        vm.warp(block.timestamp + duration);

        vm.prank(creator);
        streamPayment.proposeRateChange(streamId, newRate);

        uint256 earningsBefore = streamPayment.getCreatorEarnings(creator);

        vm.prank(alice);
        streamPayment.acceptRateChange(streamId);

        // Verify earnings increased
        assertTrue(streamPayment.getCreatorEarnings(creator) > earningsBefore);

        // Verify rate changed
        assertEq(streamPayment.getStream(streamId).ratePerSecond, newRate);
    }

    /*//////////////////////////////////////////////////////////////
                    BATCH OPERATIONS FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_BatchStopStreams_VariousArraySizes(
        uint8 numStreams
    ) public {
        numStreams = uint8(bound(numStreams, 1, 20));

        uint256 deposit = 500_000;
        uint256[] memory streamIds = new uint256[](numStreams);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit * numStreams);

        for (uint256 i = 0; i < numStreams; i++) {
            streamIds[i] = streamPayment.createStream(creator, 333, deposit);
        }

        vm.warp(block.timestamp + 60);

        streamPayment.batchStopStreams(streamIds);
        vm.stopPrank();

        // Verify all stopped
        for (uint256 i = 0; i < numStreams; i++) {
            assertFalse(streamPayment.getStream(streamIds[i]).isActive);
        }

        assertEq(streamPayment.getCreatorActiveStreamCount(creator), 0);
    }

    /*//////////////////////////////////////////////////////////////
                    DEPLETION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_IsStreamDepleted_VariousScenarios(
        uint256 rate,
        uint256 deposit,
        uint256 elapsedTime
    ) public {
        rate = bound(rate, 1, 10_000);
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );
        elapsedTime = bound(elapsedTime, 0, 10_000);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);
        vm.stopPrank();

        vm.warp(block.timestamp + elapsedTime);

        uint256 expectedOwed = elapsedTime * rate;
        bool shouldBeDepleted = expectedOwed >= deposit;

        assertEq(streamPayment.isStreamDepleted(streamId), shouldBeDepleted);
    }

    function testFuzz_GetStreamedAmount_AlwaysCappedAtDeposit(
        uint256 rate,
        uint256 deposit,
        uint256 elapsedTime
    ) public {
        rate = bound(rate, 1, 10_000);
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );
        elapsedTime = bound(elapsedTime, 0, 100_000);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);
        vm.stopPrank();

        vm.warp(block.timestamp + elapsedTime);

        uint256 streamed = streamPayment.getStreamedAmount(streamId);

        // Streamed amount should never exceed deposit
        assertLe(streamed, deposit);

        // Calculate expected
        uint256 expected = elapsedTime * rate;
        if (expected > deposit) expected = deposit;

        assertEq(streamed, expected);
    }

    /*//////////////////////////////////////////////////////////////
                    EARNINGS CALCULATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_EarningsCalculation_ConsistentWithFees(
        uint256 rate,
        uint256 deposit,
        uint256 duration
    ) public {
        rate = bound(rate, 100, 5_000);
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            streamPayment.MAX_DEPOSIT()
        );
        duration = bound(duration, 1, 1_000);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);

        vm.warp(block.timestamp + duration);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 totalOwed = duration * rate;
        if (totalOwed > deposit) totalOwed = deposit;

        uint256 expectedFee = (totalOwed * PLATFORM_FEE) / 10_000;
        uint256 expectedCreatorAmount = totalOwed - expectedFee;

        // Verify fee split
        assertApproxEqAbs(
            streamPayment.getCreatorEarnings(creator),
            expectedCreatorAmount,
            1
        );
        assertApproxEqAbs(streamPayment.platformEarnings(), expectedFee, 1);
    }

    /*//////////////////////////////////////////////////////////////
                    PLATFORM FEE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_UpdatePlatformFee_ValidRange(uint256 newFee) public {
        newFee = bound(newFee, 0, streamPayment.MAX_PLATFORM_FEE());

        vm.prank(owner);
        streamPayment.updatePlatformFee(newFee);

        assertEq(streamPayment.platformFee(), newFee);
    }

    function testFuzz_UpdatePlatformFee_InvalidRange(uint256 newFee) public {
        newFee = bound(
            newFee,
            streamPayment.MAX_PLATFORM_FEE() + 1,
            type(uint256).max
        );

        vm.prank(owner);
        vm.expectRevert(Errors.InvalidFee.selector);
        streamPayment.updatePlatformFee(newFee);
    }

    /*//////////////////////////////////////////////////////////////
                    GAS OPTIMIZATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_Gas_CreateStream(uint256 rate, uint256 deposit) public {
        rate = bound(rate, 1, 10_000); // Reasonable rate range

        // Cap deposit at reasonable amount for gas testing
        uint256 maxTestDeposit = 1_000_000; // $1 in USDC (6 decimals)
        if (maxTestDeposit < streamPayment.MIN_DEPOSIT()) {
            maxTestDeposit = streamPayment.MIN_DEPOSIT();
        }

        deposit = bound(deposit, streamPayment.MIN_DEPOSIT(), maxTestDeposit);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);

        uint256 gasBefore = gasleft();
        streamPayment.createStream(creator, rate, deposit);
        uint256 gasUsed = gasBefore - gasleft();
        vm.stopPrank();

        // Should be under 250k gas (realistic constraint)
        assertLt(gasUsed, 250_000);
    }

    function testFuzz_Gas_StopStream(uint256 duration) public {
        duration = bound(duration, 0, 1_000);

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), 1_000_000);
        uint256 streamId = streamPayment.createStream(creator, 333, 1_000_000);

        vm.warp(block.timestamp + duration);

        uint256 gasBefore = gasleft();
        streamPayment.stopStream(streamId);
        uint256 gasUsed = gasBefore - gasleft();
        vm.stopPrank();

        // Should be under 100k gas
        assertLt(gasUsed, 100_000);
    }

    /*//////////////////////////////////////////////////////////////
                    INVARIANT HELPERS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_Invariant_TotalSupplyConsistency(
        uint256 rate,
        uint256 deposit,
        uint256 duration
    ) public {
        rate = bound(rate, 100, 5_000);
        deposit = bound(
            deposit,
            streamPayment.MIN_DEPOSIT(),
            10_000_000 // $10 max to avoid overflow
        );
        duration = bound(duration, 1, 1_000);

        uint256 totalSupplyBefore = usdc.totalSupply();

        vm.startPrank(alice);
        usdc.approve(address(streamPayment), deposit);
        uint256 streamId = streamPayment.createStream(creator, rate, deposit);

        vm.warp(block.timestamp + duration);
        streamPayment.stopStream(streamId);
        vm.stopPrank();

        uint256 totalSupplyAfter = usdc.totalSupply();

        // Total supply should remain constant (no tokens minted/burned)
        assertEq(totalSupplyBefore, totalSupplyAfter);

        // Invariant: contract balance + pending earnings should equal deposited amount
        uint256 contractBalance = usdc.balanceOf(address(streamPayment));
        uint256 pendingEarnings = streamPayment.getCreatorEarnings(creator);
        uint256 platformFees = streamPayment.platformEarnings();

        // All funds should be accounted for in contract
        assertEq(contractBalance, pendingEarnings + platformFees);
    }
}
