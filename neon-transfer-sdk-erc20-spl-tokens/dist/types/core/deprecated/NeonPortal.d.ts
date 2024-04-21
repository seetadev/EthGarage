import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TransactionConfig } from 'web3-core';
import { InstructionService } from './InstructionService';
import { Amount, SPLToken } from '../../models';
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in neon-transfer.ts file
 * For more examples see `examples` folder
 */
export declare class NeonPortal extends InstructionService {
    createNeonTransfer(amount: number, splToken: SPLToken, events?: import("../../models").InstructionEvents): Promise<void>;
    createSolanaTransfer(amount: number, splToken: SPLToken, events?: import("../../models").InstructionEvents): Promise<void>;
    neonTransferTransaction(amount: Amount, token: SPLToken, serviceWallet?: PublicKey, rewardAmount?: Amount): Promise<Transaction>;
    createDepositInstruction(solanaPubkey: PublicKey, neonPubkey: PublicKey, depositPubkey: PublicKey, neonWalletAddress: string, serviceWallet?: PublicKey): TransactionInstruction;
    neonTransferInstruction(solanaWallet: PublicKey, serviceWallet: PublicKey, rewardAmount: Amount): TransactionInstruction;
    getAuthorityPoolAddress(): [PublicKey, number];
    createWithdrawEthTransactionData(): string;
    ethereumTransaction(amount: Amount, token: SPLToken): TransactionConfig;
    createWithdrawWNeonTransaction(amount: Amount, address: string): string;
    wNeonTransaction(amount: Amount, token: SPLToken): TransactionConfig;
    neonTransaction(amount: Amount, token: SPLToken): TransactionConfig;
}
