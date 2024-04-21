import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TransactionConfig } from 'web3-core';
import { InstructionService } from './InstructionService';
import { Amount, SPLToken } from '../../models';
import {
  createNeonDepositInstruction,
  createNeonTransferInstruction,
  neonTransactionDataWeb3,
  solanaNEONTransferTransaction
} from '../neon-transfer';
import { authorityPoolAddress } from '../utils';

/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in neon-transfer.ts file
 * For more examples see `examples` folder
 */
export class NeonPortal extends InstructionService {
  // Solana -> Neon
  async createNeonTransfer(amount: number, splToken: SPLToken, events = this.events) {
    this.emitFunction(events.onBeforeCreateInstruction);
    const transaction = await this.neonTransferTransaction(amount, splToken);
    this.emitFunction(events.onBeforeSignTransaction);
    try {
      const signedTransaction = await this.solana.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), this.solanaOptions);
      this.emitFunction(events.onSuccessSign, signature);
    } catch (error) {
      this.emitFunction(events.onErrorSign, error);
    }
  }

  // Neon -> Solana
  async createSolanaTransfer(amount: number, splToken: SPLToken, events = this.events) {
    this.emitFunction(events.onBeforeCreateInstruction);
    const transaction = this.ethereumTransaction(amount, splToken);
    this.emitFunction(events.onBeforeSignTransaction);
    try {
      const neonTransaction = await this.web3.eth.sendTransaction(transaction);
      this.emitFunction(events.onSuccessSign, undefined, neonTransaction.transactionHash);
    } catch (error) {
      this.emitFunction(events.onErrorSign, error);
    }
  }

  async neonTransferTransaction(amount: Amount, token: SPLToken, serviceWallet?: PublicKey, rewardAmount?: Amount): Promise<Transaction> {
    const transaction = await solanaNEONTransferTransaction(this.solanaWalletPubkey, this.neonWalletAddress, this.programId, this.tokenMint, token, amount, 111
      , serviceWallet, rewardAmount);
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash('finalized')).blockhash;
    return transaction;
  }

  createDepositInstruction(solanaPubkey: PublicKey, neonPubkey: PublicKey, depositPubkey: PublicKey, neonWalletAddress: string, serviceWallet?: PublicKey): TransactionInstruction {
    return createNeonDepositInstruction(solanaPubkey, neonPubkey, depositPubkey, neonWalletAddress, this.programId, this.tokenMint, serviceWallet);
  }

  neonTransferInstruction(solanaWallet: PublicKey, serviceWallet: PublicKey, rewardAmount: Amount): TransactionInstruction {
    return createNeonTransferInstruction(this.tokenMint, solanaWallet, serviceWallet, rewardAmount);
  }

  getAuthorityPoolAddress(): [PublicKey, number] {
    return authorityPoolAddress(this.programId);
  }

  createWithdrawEthTransactionData(): string {
    return neonTransactionDataWeb3(this.web3, this.solanaWalletPubkey);
  }

  ethereumTransaction(amount: Amount, token: SPLToken): TransactionConfig {
    const from = this.neonWalletAddress;
    const to = this.neonContractAddress;
    const value = `0x${BigInt(this.web3.utils.toWei(amount.toString(), 'ether')).toString(16)}`;
    const data = this.createWithdrawEthTransactionData();
    return { from, to, value, data };
  }

  createWithdrawWNeonTransaction(amount: Amount, address: string): string {
    const contract = this.neonWrapper2Contract(address);
    return contract.methods.withdraw(amount).encodeABI();
  }

  wNeonTransaction(amount: Amount, token: SPLToken): TransactionConfig {
    const from = this.neonWalletAddress;
    const to = token.address;
    const value = `0x0`;
    const data = this.createWithdrawWNeonTransaction(this.web3.utils.toWei(amount.toString(), 'ether'), to);
    return { from, to, value, data };
  }

  neonTransaction(amount: Amount, token: SPLToken): TransactionConfig {
    const from = this.neonWalletAddress;
    const to = token.address;
    const value = `0x${BigInt(this.web3.utils.toWei(amount.toString(), 'ether')).toString(16)}`;
    const data = this.createWithdrawEthTransactionData();
    return { from, to, value, data };
  }
}
