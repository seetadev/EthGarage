// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { InterchainTokenExecutable } from '@axelar-network/interchain-token-service/executable/InterchainTokenExecutable.sol';
import { IERC20 } from "openzeppelin-contracts/interfaces/IERC20.sol";
import { TokenFundedGateway, SubnetID, convertAddress } from "./Types.sol";

contract IpcTokenHandler is InterchainTokenExecutable {
    TokenFundedGateway public ipcGateway;

    constructor(address _axelarIts, address _ipcGateway) InterchainTokenExecutable(_axelarIts) {
        ipcGateway = TokenFundedGateway(_ipcGateway);
    }

    function _executeWithInterchainToken(
        bytes32,
        string calldata,
        bytes calldata,
        bytes calldata data,
        bytes32,
        address tokenAddr,
        uint256 amount
    ) internal override {
        (SubnetID memory subnet, address recipient) = abi.decode(data, (SubnetID, address));

        IERC20 token = IERC20(tokenAddr);
        require(token.balanceOf(address(this)) >= amount, "insufficient balance");

        token.approve(address(ipcGateway), amount);

        ipcGateway.fundWithToken(subnet, convertAddress(recipient), amount);
    }
}