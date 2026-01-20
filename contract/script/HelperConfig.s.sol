// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        address usdcAddress;
        uint256 platformFee;
        uint256 deployerKey;
    }

    uint256 public constant DEFAULT_ANVIL_PRIVATE_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 80002) {
            activeNetworkConfig = getPolygonAmoyConfig();
        } else if (block.chainid == 137) {
            activeNetworkConfig = getPolygonMainnetConfig();
        } else if (block.chainid == 84532) {
            activeNetworkConfig = getBaseSepoliaConfig();
        } else if (block.chainid == 8453) {
            activeNetworkConfig = getBaseMainnetConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilConfig();
        }
    }

    // USDC address: circle's USDC on Amoy
    function getPolygonAmoyConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                usdcAddress: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582,
                platformFee: 10, // 0.1% (10 basis points)
                deployerKey: vm.envUint("PRIVATE_KEY")
            });
    }

    // USDC address: circle's native USDC on polygon PoS
    function getPolygonMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                usdcAddress: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359,
                platformFee: 10, // 0.1%
                deployerKey: vm.envUint("PRIVATE_KEY")
            });
    }

    // USDC address: circle's USDC on base sepolia
    function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                usdcAddress: 0x036CbD53842c5426634e7929541eC2318f3dCF7e,
                platformFee: 10, // 0.1%
                deployerKey: vm.envUint("PRIVATE_KEY")
            });
    }

    // USDC address: circle's native USDC on base
    function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                usdcAddress: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
                platformFee: 10, // 0.1%
                deployerKey: vm.envUint("PRIVATE_KEY")
            });
    }

    function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.usdcAddress != address(0)) {
            return activeNetworkConfig;
        }

        vm.startBroadcast(DEFAULT_ANVIL_PRIVATE_KEY);
        ERC20Mock mockUsdc = new ERC20Mock();
        vm.stopBroadcast();

        console2.log("Mock USDC deployed at:", address(mockUsdc));

        return
            NetworkConfig({
                usdcAddress: address(mockUsdc),
                platformFee: 10, // 0.1%
                deployerKey: DEFAULT_ANVIL_PRIVATE_KEY
            });
    }

    function getConfig() public view returns (NetworkConfig memory) {
        return activeNetworkConfig;
    }

    function getNetworkName() public view returns (string memory) {
        if (block.chainid == 80002) return "Polygon Amoy Testnet";
        if (block.chainid == 137) return "Polygon Mainnet";
        if (block.chainid == 84532) return "Base Sepolia Testnet";
        if (block.chainid == 8453) return "Base Mainnet";
        if (block.chainid == 31337) return "Anvil (Local)";
        return "Unknown Network";
    }

    function getBlockExplorerUrl() public view returns (string memory) {
        if (block.chainid == 80002) return "https://amoy.polygonscan.com";
        if (block.chainid == 137) return "https://polygonscan.com";
        if (block.chainid == 84532) return "https://sepolia.basescan.org";
        if (block.chainid == 8453) return "https://basescan.org";
        return "N/A (Local Network)";
    }

    /**
     * checks if running on a testnet
     */
    function isTestnet() public view returns (bool) {
        return
            block.chainid == 80002 ||
            block.chainid == 84532 ||
            block.chainid == 31337;
    }

    /**
     * checks if running on mainnet
     */
    function isMainnet() public view returns (bool) {
        return block.chainid == 137 || block.chainid == 8453;
    }
}
