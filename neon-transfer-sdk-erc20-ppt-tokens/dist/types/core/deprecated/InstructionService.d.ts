/// <reference types="node" />
import { AccountInfo, Connection, PublicKey, SendOptions, TransactionInstruction } from '@solana/web3.js';
import { Account, TransactionConfig } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { Buffer } from 'buffer';
import Web3 from 'web3';
import { NeonProxyRpcApi } from '../../api';
import { Amount, InstructionEvents, InstructionParams, NeonProgramStatus, SPLToken } from '../../models';
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods from mint-transfer.ts and neon-transfer.ts files
 * For more examples see `examples` folder
 */
export declare class InstructionService {
    solanaWalletAddress: PublicKey;
    neonWalletAddress: string;
    neonContractAddress: string;
    web3: Web3;
    proxyApi: NeonProxyRpcApi;
    proxyStatus: NeonProgramStatus;
    connection: Connection;
    events: InstructionEvents;
    solanaOptions: SendOptions;
    get programId(): PublicKey;
    get tokenMint(): PublicKey;
    constructor(options: InstructionParams);
    get erc20ForSPLContract(): Contract;
    get neonWrapperContract(): Contract;
    neonWrapper2Contract(address: string): Contract;
    get solana(): any;
    get solanaWalletPubkey(): PublicKey;
    get solanaWalletSigner(): Account;
    neonAccountAddress(neonWallet: string): [PublicKey, number];
    authAccountAddress(neonWallet: string, token: SPLToken): [PublicKey, number];
    getNeonAccount(neonAssociatedKey: PublicKey): Promise<AccountInfo<Buffer> | null>;
    createAccountV3Instruction(solanaWallet: PublicKey, neonWalletPDA: PublicKey, neonWallet: string): TransactionInstruction;
    getAssociatedTokenAddress(mintPubkey: PublicKey, walletPubkey: PublicKey): PublicKey;
    approveDepositInstruction(walletPubkey: PublicKey, neonPDAPubkey: PublicKey, associatedTokenPubkey: PublicKey, amount: number | bigint): TransactionInstruction;
    createApproveSolanaData(solanaWallet: PublicKey, splToken: SPLToken, amount: Amount): string;
    ethereumTransaction(amount: Amount, token: SPLToken): TransactionConfig;
    emitFunction: (functionName?: Function, ...args: any[]) => void;
}
