// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { IInterchainTokenService } from "@axelar-network/interchain-token-service/interfaces/IInterchainTokenService.sol";
import { AddressBytes } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/libs/AddressBytes.sol";
import { IERC20 } from "openzeppelin-contracts/interfaces/IERC20.sol";
import { SubnetID } from "./Types.sol";

contract IpcTokenSender {
    IInterchainTokenService public immutable axelarIts;
    string public destinationChain;
    bytes public destinationTokenHandler;

    constructor(address _axelarIts, string memory _destinationChain, address _destinationTokenHandler) {
        axelarIts = IInterchainTokenService(_axelarIts);
        destinationChain = _destinationChain;
        destinationTokenHandler = AddressBytes.toBytes(_destinationTokenHandler);
    }

    function fundSubnet(bytes32 tokenId, SubnetID calldata subnet, address recipient, uint256 amount) external payable {
        require(msg.value > 0, "gas payment is required");

        address tokenAddress = axelarIts.validTokenAddress(tokenId);
        require(tokenAddress != address(0), "could not resolve token address");

        IERC20 token = IERC20(tokenAddress);

        require(token.balanceOf(msg.sender) >= amount, "insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "insufficient token allowance");

        token.transferFrom(msg.sender, address(this), amount);
        token.approve(address(axelarIts), amount);
        bytes memory payload = abi.encode(subnet, recipient);
        axelarIts.callContractWithInterchainToken{ value: msg.value }(
            tokenId,
            destinationChain,
            destinationTokenHandler,
            amount,
            payload,
            msg.value
        );
    }
}