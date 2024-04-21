import { Connection, PublicKey } from '@solana/web3.js';
import { TransactionConfig } from 'web3-core';
import Web3 from 'web3';
import { NeonProxyRpcApi } from '../api';
import { InstructionEvents, SPLToken } from '../models';
export declare const proxyApi: NeonProxyRpcApi;
export declare function useNeonTransfer(events: InstructionEvents, connection: Connection, web3: Web3, publicKey: PublicKey, neonWalletAddress: string, neonContractAddress?: string): {
    deposit: (amount: number, splToken: SPLToken) => any;
    withdraw: (amount: number, splToken: SPLToken, to: string) => any;
    getEthereumTransactionParams: (amount: number, splToken: SPLToken) => TransactionConfig;
    proxyStatus: import("../models").NeonProgramStatus;
};
