// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {StreamPayment} from "../src/StreamPayment.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployStreamPayment is Script {
    StreamPayment public streamPayment;
    HelperConfig public helperConfig;

    function run() external returns (StreamPayment, HelperConfig) {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        vm.startBroadcast(config.deployerKey);
        streamPayment = new StreamPayment(
            config.usdcAddress,
            config.platformFee
        );
        vm.stopBroadcast();

        console2.log("");
        console2.log("Deployment Successful!");
        console2.log("========================================");
        console2.log("StreamPayment Address:", address(streamPayment));
        console2.log("Owner:", streamPayment.owner());
        console2.log("USDC Token:", address(streamPayment.usdcToken()));
        console2.log("========================================");

        if (!helperConfig.isTestnet() && block.chainid != 31337) {
            console2.log("");
            console2.log("Verify contract with:");
            console2.log(
                string.concat(
                    "forge verify-contract ",
                    vm.toString(address(streamPayment)),
                    " StreamPayment --chain ",
                    vm.toString(block.chainid),
                    " --constructor-args $(cast abi-encode 'constructor(address,uint256)' ",
                    vm.toString(config.usdcAddress),
                    " ",
                    vm.toString(config.platformFee),
                    ")"
                )
            );
        }

        if (block.chainid != 31337) {
            console2.log("");
            console2.log("View on Explorer:");
            console2.log(
                string.concat(
                    helperConfig.getBlockExplorerUrl(),
                    "/address/",
                    vm.toString(address(streamPayment))
                )
            );
        }

        console2.log("========================================");

        return (streamPayment, helperConfig);
    }

    function deployWithConfig(
        address usdcAddress,
        uint256 platformFee,
        uint256 deployerKey
    ) public returns (StreamPayment) {
        vm.startBroadcast(deployerKey);
        StreamPayment deployment = new StreamPayment(usdcAddress, platformFee);
        vm.stopBroadcast();

        return deployment;
    }
}
