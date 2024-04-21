import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';
import { AccountMeta, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Account, SignedTransaction, TransactionConfig } from 'web3-core';
import { toFullAmount } from '../../utils';
import { Amount, SPLToken } from '../../models';
import {
  climeTransactionDataWeb3,
  createClaimInstruction,
  createComputeBudgetHeapFrameInstruction,
  createComputeBudgetUtilsInstruction,
  createExecFromDataInstruction,
  createMintNeonTransactionWeb3,
  createMintSolanaTransaction,
  createUnwrapSOLTransaction,
  createWrapSOLTransaction,
  neonClaimTransactionFromSigner,
  neonTransferMintTransaction
} from '../mint-transfer';
import { collateralPoolAddress, solanaWalletSigner } from '../utils';
import { InstructionService } from './InstructionService';

/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in mint-transfer.ts file
 * For more examples see `examples` folder
 */
export class MintPortal extends InstructionService {
  // Solana -> Neon
  async createNeonTransfer(amount: number, splToken: SPLToken, events = this.events) {
    this.emitFunction(events.onBeforeCreateInstruction);
    const transaction = await this.neonTransferTransaction(amount, splToken);
    this.emitFunction(events.onBeforeSignTransaction);
    try {
      const signedTransaction = await this.solana.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), this.solanaOptions);
      this.emitFunction(events.onSuccessSign, signature);
    } catch (e) {
      this.emitFunction(events.onErrorSign, e);
    }
  }

  // Neon -> Solana
  async createSolanaTransfer(amount: number, splToken: SPLToken, events = this.events) {
    const mintPubkey = new PublicKey(splToken.address_spl);
    const walletPubkey = this.solanaWalletPubkey;
    const associatedTokenPubkey = getAssociatedTokenAddressSync(mintPubkey, walletPubkey);
    const solanaTransaction = await this.solanaTransferTransaction(walletPubkey, mintPubkey, associatedTokenPubkey);
    const neonTransaction = await this.createNeonTransaction(this.neonWalletAddress, associatedTokenPubkey, splToken, amount);
    neonTransaction.nonce = await this.web3.eth.getTransactionCount(this.neonWalletAddress);
    this.emitFunction(events.onBeforeSignTransaction);
    try {
      const signedSolanaTransaction = await this.solana.signTransaction(solanaTransaction);
      const signature = await this.connection.sendRawTransaction(signedSolanaTransaction.serialize(), this.solanaOptions);
      const { transactionHash } = await this.web3.eth.sendTransaction(neonTransaction);
      this.emitFunction(events.onSuccessSign, signature, transactionHash);
    } catch (error) {
      this.emitFunction(events.onErrorSign, error);
    }
  }

  async neonTransferTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction> {
    const fullAmount = toFullAmount(amount, splToken.decimals);
    const walletSigner = await solanaWalletSigner(this.web3, this.solanaWalletPubkey, this.neonWalletAddress);
    const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), this.solanaWalletPubkey);
    const climeData = climeTransactionDataWeb3(this.web3, associatedTokenAddress, this.neonWalletAddress, fullAmount);
    const signedTransaction = await neonClaimTransactionFromSigner(climeData, walletSigner, this.neonWalletAddress, splToken);
    const {
      neonKeys,
      legacyAccounts
    } = await createClaimInstruction(this.proxyApi, signedTransaction);
    const transaction = await neonTransferMintTransaction(this.connection, this.proxyStatus, this.programId, this.solanaWalletPubkey, this.neonWalletAddress, walletSigner, neonKeys, legacyAccounts, signedTransaction, splToken, fullAmount, 111);
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    return transaction;
  }

  computeBudgetUtilsInstruction(programId: PublicKey): TransactionInstruction {
    return createComputeBudgetUtilsInstruction(programId, this.proxyStatus);
  }

  computeBudgetHeapFrameInstruction(programId: PublicKey): TransactionInstruction {
    return createComputeBudgetHeapFrameInstruction(programId, this.proxyStatus);
  }

  async createClaimInstruction(owner: PublicKey, from: PublicKey, to: string, splToken: SPLToken, emulateSigner: Account, amount: any): Promise<{ neonKeys: AccountMeta[], neonTransaction: SignedTransaction, emulateSigner: Account, nonce: number }> {
    const nonce = await this.web3.eth.getTransactionCount(emulateSigner.address);
    const fullAmount = toFullAmount(amount, splToken.decimals);
    const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), this.solanaWalletAddress);
    const climeData = climeTransactionDataWeb3(this.web3, associatedTokenAddress, this.neonWalletAddress, fullAmount);
    const walletSigner = await solanaWalletSigner(this.web3, this.solanaWalletAddress, this.neonWalletAddress);
    const signedTransaction = await neonClaimTransactionFromSigner(climeData, walletSigner, this.neonWalletAddress, splToken);
    const {
      neonKeys,
      neonTransaction
    } = await createClaimInstruction(this.proxyApi, signedTransaction);
    return { neonKeys, neonTransaction: signedTransaction, emulateSigner, nonce };
  }

  makeTrExecFromDataIx(neonAddress: PublicKey, neonRawTransaction: string, neonKeys: AccountMeta[]): TransactionInstruction {
    return createExecFromDataInstruction(this.solanaWalletPubkey, neonAddress, this.programId, neonRawTransaction, neonKeys, this.proxyStatus);
  }

  getCollateralPoolAddress(collateralPoolIndex: number): [PublicKey, number] {
    return collateralPoolAddress(this.programId, collateralPoolIndex);
  }

  async createNeonTransaction(neonWallet: string, solanaWallet: PublicKey, splToken: SPLToken, amount: Amount): Promise<TransactionConfig> {
    return createMintNeonTransactionWeb3(this.web3, neonWallet, solanaWallet, splToken, amount);
  }

  async solanaTransferTransaction(walletPubkey: PublicKey, mintPubkey: PublicKey, associatedTokenPubkey: PublicKey): Promise<Transaction> {
    const transaction = createMintSolanaTransaction(walletPubkey, mintPubkey, associatedTokenPubkey, this.proxyStatus);
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    return transaction;
  }

  // #region Neon -> Solana
  createAssociatedTokenAccountInstruction(associatedProgramId: PublicKey, programId: PublicKey, mint: PublicKey, associatedAccount: PublicKey, owner: PublicKey, payer: PublicKey): TransactionInstruction {
    return createAssociatedTokenAccountInstruction(mint, associatedAccount, owner, payer);
  }

  async wrapSOLTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction> {
    const transaction = await createWrapSOLTransaction(this.connection, this.solanaWalletPubkey, amount, splToken);
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    return transaction;
  }

  async unwrapSOLTransaction(amount: Amount, splToken: SPLToken): Promise<Transaction> {
    const transaction = await createUnwrapSOLTransaction(this.connection, this.solanaWalletPubkey, splToken);
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    return transaction;
  }
}
