import { erc20Abi, neonWrapper2Abi, neonWrapperAbi } from '../../data';
export function erc20ForSPLContractWeb3(web3) {
    return new web3.eth.Contract(erc20Abi);
}
export function neonWrapperContractWeb3(web3) {
    return new web3.eth.Contract(neonWrapperAbi);
}
export function neonWrapper2ContractWeb3(web3, address) {
    return new web3.eth.Contract(neonWrapper2Abi, address);
}
