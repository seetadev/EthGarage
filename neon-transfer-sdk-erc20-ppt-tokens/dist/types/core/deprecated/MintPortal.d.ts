import { AccountMeta, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Account, SignedTransaction, TransactionConfig } from 'web3-core';
import { Amount, SPLToken } from '../../models';
import { InstructionService } from './InstructionService';
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in mint-transfer.ts file
 * For more examples see `examples` folder
 */
export declare class MintPortal extends InstructionService {
    createNeonTransfer(amount: number, splToken: SPLToken, events?: import("../../models").InstructionEvents): Promise<void>;
    createSolanaTransfer(amount: number, splToken: SPLToken, events?: import("../../models").InstructionEvents): Promise<void>;
    neonTransferTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction>;
    computeBudgetUtilsInstruction(programId: PublicKey): TransactionInstruction;
    computeBudgetHeapFrameInstruction(programId: PublicKey): TransactionInstruction;
    createClaimInstruction(owner: PublicKey, from: PublicKey, to: string, splToken: SPLToken, emulateSigner: Account, amount: any): Promise<{
        neonKeys: AccountMeta[];
        neonTransaction: SignedTransaction;
        emulateSigner: Account;
        nonce: number;
    }>;
    makeTrExecFromDataIx(neonAddress: PublicKey, neonRawTransaction: string, neonKeys: AccountMeta[]): TransactionInstruction;
    getCollateralPoolAddress(collateralPoolIndex: number): [PublicKey, number];
    createNeonTransaction(neonWallet: string, solanaWallet: PublicKey, splToken: SPLToken, amount: Amount): Promise<TransactionConfig>;
    solanaTransferTransaction(walletPubkey: PublicKey, mintPubkey: PublicKey, associatedTokenPubkey: PublicKey): Promise<Transaction>;
    createAssociatedTokenAccountInstruction(associatedProgramId: PublicKey, programId: PublicKey, mint: PublicKey, associatedAccount: PublicKey, owner: PublicKey, payer: PublicKey): TransactionInstruction;
    wrapSOLTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction>;
    unwrapSOLTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction>;
}
