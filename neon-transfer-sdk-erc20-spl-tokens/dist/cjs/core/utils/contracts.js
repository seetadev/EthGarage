"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neonWrapper2ContractWeb3 = exports.neonWrapperContractWeb3 = exports.erc20ForSPLContractWeb3 = void 0;
const data_1 = require("../../data");
function erc20ForSPLContractWeb3(web3) {
    return new web3.eth.Contract(data_1.erc20Abi);
}
exports.erc20ForSPLContractWeb3 = erc20ForSPLContractWeb3;
function neonWrapperContractWeb3(web3) {
    return new web3.eth.Contract(data_1.neonWrapperAbi);
}
exports.neonWrapperContractWeb3 = neonWrapperContractWeb3;
function neonWrapper2ContractWeb3(web3, address) {
    return new web3.eth.Contract(data_1.neonWrapper2Abi, address);
}
exports.neonWrapper2ContractWeb3 = neonWrapper2ContractWeb3;
