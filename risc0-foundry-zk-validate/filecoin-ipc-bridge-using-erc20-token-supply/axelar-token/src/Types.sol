// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// For delegated FIL address
uint8 constant DELEGATED = 4;
uint64 constant EAM_ACTOR = 10;

struct SubnetID {
    uint64 root;
    address[] route;
}

struct FvmAddress {
    uint8 addrType;
    bytes payload;
}

struct DelegatedAddress {
    uint64 namespace;
    uint128 length;
    bytes buffer;
}

interface TokenFundedGateway {
    function fundWithToken(SubnetID calldata subnetId, FvmAddress calldata to, uint256 amount) external;
}

/// TODO here temporarily because we're missing a Solidity SDK, and I wasn't able to quickly figure out the import
///  path situation with forge build and remappings.
/// @notice Creates a FvmAddress from address type
function convertAddress(address addr) pure returns (FvmAddress memory fvmAddress) {
    bytes memory payload = abi.encode(
        DelegatedAddress({namespace: EAM_ACTOR, length: 20, buffer: abi.encodePacked(addr)})
    );
    fvmAddress = FvmAddress({addrType: DELEGATED, payload: payload});
}