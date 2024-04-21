import { Connection, PublicKey } from '@solana/web3.js';
import { TransactionConfig } from 'web3-core';
import Web3 from 'web3';
import { NeonProxyRpcApi } from '../api';
import { MintPortal, NeonPortal } from '../core';
import { InstructionEvents, InstructionParams, SPLToken } from '../models';
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
export function useNeonTransfer(events: InstructionEvents, connection: Connection, web3: Web3, publicKey: PublicKey, neonWalletAddress: string, neonContractAddress = NEON_TRANSFER_CONTRACT_DEVNET) {
  const proxyStatus = useProxyInfo(proxyApi);
  const options: InstructionParams = {
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

  const portalInstance = (addr: string) => {
    return proxyStatus.NEON_TOKEN_MINT === addr ? neonPortal : mintPortal;
  };

  const getEthereumTransactionParams = (amount: number, splToken: SPLToken): TransactionConfig => {
    const portal = portalInstance(splToken.address_spl);
    return portal.ethereumTransaction.call(portal, amount, splToken);
  };

  const deposit = (amount: number, splToken: SPLToken): any => {
    const portal = portalInstance(splToken.address_spl);
    return portal.createNeonTransfer.call(portal, amount, splToken, events);
  };

  const withdraw = (amount: number, splToken: SPLToken, to: string): any => {
    const portal = portalInstance(splToken.address_spl);
    return portal.createSolanaTransfer.call(portal, amount, splToken, events);
  };

  return { deposit, withdraw, getEthereumTransactionParams, proxyStatus };
}
