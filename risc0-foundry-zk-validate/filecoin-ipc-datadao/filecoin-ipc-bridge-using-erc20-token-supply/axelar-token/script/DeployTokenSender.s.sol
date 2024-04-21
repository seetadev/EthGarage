// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 as console } from "forge-std/Script.sol";
import "../src/IpcTokenSender.sol";

contract DeployScript is Script {
    IpcTokenSender public sender;

    function setUp() public {}

    function run() public {
        string memory originNetwork = vm.envString("ORIGIN_NETWORK");
        string memory destNetwork = vm.envString("DEST_NETWORK");
        uint256 privateKey = vm.envUint(string.concat(originNetwork, "__PRIVATE_KEY"));

        console.log("loading handler address...");

        string memory path = string.concat(vm.projectRoot(), "/out/addresses.json");
        require(vm.exists(path), "no addresses.json; please run DeployTokenHandler on the destination chain");

        string memory json = vm.readFile(path);
        address handlerAddr = vm.parseJsonAddress(json, ".dest.token_handler");
        console.log("handler address: %s", handlerAddr);

        console.log("deploying token sender to %s...", originNetwork);

        // Deploy the sender on Mumbai.
        vm.startBroadcast(privateKey);
        sender = new IpcTokenSender({
            _axelarIts: vm.envAddress(string.concat(originNetwork, "__AXELAR_ITS_ADDRESS")),
            _destinationChain: vm.envString(string.concat(destNetwork, "__AXELAR_CHAIN_NAME")),
            _destinationTokenHandler: handlerAddr
        });
        vm.stopBroadcast();

        console.log("token sender deployed on %s: %s", originNetwork, address(sender));

        string memory key = "out";
        vm.serializeString(key, "network", originNetwork);
        json = vm.serializeAddress(key, "token_sender", address(sender));
        vm.writeJson(json, path, ".src");

    }
}
