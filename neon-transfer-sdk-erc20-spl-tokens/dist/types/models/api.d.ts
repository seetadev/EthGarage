import { AccountMeta, PublicKey } from '@solana/web3.js';
import { SignedTransaction } from 'web3-core';
import Web3 from 'web3';
import { NeonProxyRpcApi } from '../api';
import { GasToken } from './token';
export declare const enum ProxyStatus {
    unknown = "UNKNOWN",
    work = "WORK",
    stop = "EMERGENCY"
}
export interface RPCResponse<T> {
    id: number | string;
    jsonrpc: string;
    result: T;
}
export interface SettingsFormState {
    solanaRpcApi: string;
    neonProxyRpcApi: string;
}
export interface NeonProgramStatus {
    NEON_ACCOUNT_SEED_VERSION: string;
    NEON_EVM_ID: string;
    NEON_EVM_STEPS_LAST_ITERATION_MAX: string;
    NEON_EVM_STEPS_MIN: string;
    NEON_GAS_LIMIT_MULTIPLIER_NO_CHAINID: string;
    NEON_HOLDER_MSG_SIZE: string;
    NEON_OPERATOR_PRIORITY_SLOTS: string;
    NEON_PAYMENT_TO_TREASURE: string;
    NEON_STORAGE_ENTRIES_IN_CONTRACT_ACCOUNT: string;
    NEON_TREASURY_POOL_COUNT: string;
    NEON_TREASURY_POOL_SEED: string;
    NEON_PKG_VERSION?: string;
    NEON_POOL_COUNT?: string;
    NEON_POOL_SEED?: string;
    NEON_REQUEST_UNITS_ADDITIONAL_FEE?: string;
    NEON_REVISION?: string;
    NEON_SEED_VERSION?: string;
    NEON_STATUS_NAME?: string;
    NEON_TOKEN_MINT?: string;
    NEON_TOKEN_MINT_DECIMALS?: string;
    NEON_PAYMENT_TO_DEPOSIT?: string;
    NEON_HEAP_FRAME?: string;
    NEON_ADDITIONAL_FEE?: string;
    NEON_CHAIN_ID?: string;
    NEON_COMPUTE_BUDGET_HEAP_FRAME?: string;
    NEON_COMPUTE_BUDGET_UNITS?: string;
    NEON_COMPUTE_UNITS?: string;
}
export interface ChainId {
    id: number;
    name: string;
}
export interface NeonEmulate {
    exit_status: 'succeed';
    result: string;
    steps_executed: number;
    used_gas: number;
    iterations: number;
    solana_accounts: SolanaAccount[];
    accounts?: NeonAccounts[];
}
export interface SolanaAccount {
    pubkey: string;
    is_writable: boolean;
    is_legacy: boolean;
}
export interface NeonAccounts {
    account: string;
    contract: string;
}
export interface ClaimInstructionResult {
    neonTransaction?: SignedTransaction;
    neonKeys: AccountMeta[];
    legacyAccounts: SolanaAccount[];
}
export interface MultiTokenProxy {
    web3: Web3;
    proxyRpc: NeonProxyRpcApi;
    proxyStatus: NeonProgramStatus;
    tokensList: GasToken[];
    evmProgramAddress: PublicKey;
}
export interface GasTokenData {
    tokenMintAddress: PublicKey;
    gasToken: GasToken;
}
