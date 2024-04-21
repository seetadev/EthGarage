// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/IpcTokenHandler.sol";
import "../src/Types.sol";
import "./DummyERC20.sol";

contract TestHandler is Test {

    function test_handler() public {
        address axelarIts = vm.addr(1);
        address ipcGateway = vm.addr(2);
        DummyERC20 token = new DummyERC20("Test token", "TST", 10000);

        IpcTokenHandler handler = new IpcTokenHandler({
            _axelarIts: axelarIts,
            _ipcGateway: ipcGateway
        });

        address[] memory route = new address[](1);
        route[0] = 0x2a3eF0F414c626e51AFA2F29f3F7Be7a45C6DB09;

        address recipient = 0x6B505cdCCCA34aE8eea5D382aBaD40d2AfEa74ad;

        SubnetID memory subnet = SubnetID({ root: 314159, route: route });
        bytes memory params = abi.encode(subnet, recipient);

        token.transfer(address(handler), 1);
        vm.startPrank(axelarIts);

        vm.mockCall(
            address(ipcGateway),
            abi.encodeWithSelector(TokenFundedGateway.fundWithToken.selector, subnet, convertAddress(recipient), 1),
            abi.encode("")
        );
        handler.executeWithInterchainToken(bytes32(""), "", "", params, bytes32(""), address(token), 1);
    }

}