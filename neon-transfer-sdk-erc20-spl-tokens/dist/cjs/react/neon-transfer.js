"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNeonTransfer = exports.proxyApi = void 0;
const api_1 = require("../api");
const core_1 = require("../core");
const proxy_status_1 = require("./proxy-status");
const data_1 = require("../data");
const urls = process.env.REACT_APP_URLS ? JSON.parse(process.env.REACT_APP_URLS) : {
    solanaRpcApi: 'https://api.devnet.solana.com',
    neonProxyRpcApi: 'https://devnet.neonevm.org'
};
exports.proxyApi = new api_1.NeonProxyRpcApi({
    solanaRpcApi: urls.solanaRpcApi,
    neonProxyRpcApi: urls.neonProxyRpcApi
});
/*
* @deprecated this code was deprecated and will remove in next releases.
* Please, don't use this hock in you codebase, for more details see our React Demo in `examples` folder
* */
function useNeonTransfer(events, connection, web3, publicKey, neonWalletAddress, neonContractAddress = data_1.NEON_TRANSFER_CONTRACT_DEVNET) {
    const proxyStatus = (0, proxy_status_1.useProxyInfo)(exports.proxyApi);
    const options = {
        connection: connection,
        solanaWalletAddress: publicKey,
        neonWalletAddress,
        neonContractAddress,
        web3,
        proxyApi: exports.proxyApi,
        proxyStatus: proxyStatus
    };
    const neonPortal = new core_1.NeonPortal(options);
    const mintPortal = new core_1.MintPortal(options);
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
exports.useNeonTransfer = useNeonTransfer;
