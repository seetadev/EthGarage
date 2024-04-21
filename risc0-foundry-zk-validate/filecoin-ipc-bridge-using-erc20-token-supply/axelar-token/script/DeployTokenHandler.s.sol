// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console2 as console } from "forge-std/Script.sol";
import "../src/IpcTokenHandler.sol";

contract DeployScript is Script {
    IpcTokenHandler public handler;

    function setUp() public {}

    function run() public {
        string memory network = vm.envString("DEST_NETWORK");
        uint256 privateKey = vm.envUint(string.concat(network, "__PRIVATE_KEY"));

        console.log("deploying token handler to %s...", network);

        // Deploy the handler on Filecoin Calibration.
        vm.startBroadcast(privateKey);
        handler = new IpcTokenHandler({
            _axelarIts: vm.envAddress(string.concat(network, "__AXELAR_ITS_ADDRESS")),
            _ipcGateway: vm.envAddress(string.concat(network, "__IPC_GATEWAY_ADDRESS"))
        });
        vm.stopBroadcast();

        console.log("token handler deployed on %s: %s", network, address(handler));

        string memory path = string.concat(vm.projectRoot(), "/out/addresses.json");
        if (!vm.exists(path)) {
            vm.writeJson("{\"dest\":{\"token_handler\":{}},\"src\":{\"token_sender\":{}}}", path);
        }

        string memory key = "out";
        vm.serializeString(key, "network", network);
        string memory json = vm.serializeAddress(key, "token_handler", address(handler));
        vm.writeJson(json, path, ".dest");
    }
}
