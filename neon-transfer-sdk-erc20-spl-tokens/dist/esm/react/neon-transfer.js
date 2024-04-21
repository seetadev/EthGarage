import { NeonProxyRpcApi } from '../api';
import { MintPortal, NeonPortal } from '../core';
import { useProxyInfo } from './proxy-status';
import { NEON_TRANSFER_CONTRACT_DEVNET } from '../data';
const urls = process.env.REACT_APP_URLS ? JSON.parse(process.env.REACT_APP_URLS) : {
    solanaRpcApi: 'https://api.devnet.solana.com',
    neonProxyRpcApi: 'https://devnet.neonevm.org'
};
export const proxyApi = new NeonProxyRpcApi({
    solanaRpcApi: urls.solanaRpcApi,
    neonProxyRpcApi: urls.neonProxyRpcApi
});
/*
* @deprecated this code was deprecated and will remove in next releases.
* Please, don't use this hock in you codebase, for more details see our React Demo in `examples` folder
* */
export function useNeonTransfer(events, connection, web3, publicKey, neonWalletAddress, neonContractAddress = NEON_TRANSFER_CONTRACT_DEVNET) {
    const proxyStatus = useProxyInfo(proxyApi);
    const options = {
        connection: connection,
        solanaWalletAddress: publicKey,
        neonWalletAddress,
        neonContractAddress,
        web3,
        proxyApi: proxyApi,
        proxyStatus: proxyStatus
    };
    const neonPortal = new NeonPortal(options);
    const mintPortal = new MintPortal(options);
    const portalInstance = (addr) => {
        return proxyStatus.NEON_TOKEN_MINT === addr ? neonPortal : mintPortal;
    };
    const getEthereumTransactionParams = (amount, splToken) => {
        const portal = portalInstance(splToken.address_spl);
        return portal.ethereumTransaction.call(portal, amount, splToken);
    };
    const deposit = (amount, splToken) => {
        const portal = portalInstance(splToken.address_spl);
        return portal.createNeonTransfer.call(portal, amount, splToken, events);
    };
    const withdraw = (amount, splToken, to) => {
        const portal = portalInstance(splToken.address_spl);
        return portal.createSolanaTransfer.call(portal, amount, splToken, events);
    };
    return { deposit, withdraw, getEthereumTransactionParams, proxyStatus };
}
