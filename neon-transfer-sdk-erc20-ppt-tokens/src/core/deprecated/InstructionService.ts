import {
  AccountInfo,
  Connection,
  PublicKey,
  SendOptions,
  TransactionInstruction
} from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { AbiItem } from 'web3-utils';
import { Account, TransactionConfig } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { Buffer } from 'buffer';
import Web3 from 'web3';

import { NeonProxyRpcApi } from '../../api';
import { toFullAmount } from '../../utils';
import { erc20Abi, NEON_TOKEN_MINT_DEVNET, neonWrapper2Abi, neonWrapperAbi } from '../../data';
import {
  Amount,
  InstructionEvents,
  InstructionParams,
  NeonProgramStatus,
  SPLToken
} from '../../models';
import { authAccountAddress, neonWalletProgramAddress, solanaWalletSigner } from '../utils';
import { createAccountV3Instruction } from '../mint-transfer';

const noop = new Function();

/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods from mint-transfer.ts and neon-transfer.ts files
 * For more examples see `examples` folder
 */
export class InstructionService {
  solanaWalletAddress: PublicKey;
  neonWalletAddress: string;
  neonContractAddress: string;
  web3: Web3;
  proxyApi: NeonProxyRpcApi;
  proxyStatus: NeonProgramStatus;
  connection: Connection;
  events: InstructionEvents;
  solanaOptions: SendOptions;

  get programId(): PublicKey {
    return new PublicKey(this.proxyStatus.NEON_EVM_ID);
  }

  get tokenMint(): PublicKey {
    return new PublicKey(this.proxyStatus.NEON_TOKEN_MINT ?? NEON_TOKEN_MINT_DEVNET);
  }

  constructor(options: InstructionParams) {
    this.web3 = options.web3;
    this.proxyApi = options.proxyApi;
    this.proxyStatus = options.proxyStatus;
    this.solanaWalletAddress = options.solanaWalletAddress || '';
    this.neonWalletAddress = options.neonWalletAddress || '';
    this.neonContractAddress = options.neonContractAddress || '';
    this.connection = options.connection;
    this.solanaOptions = options.solanaOptions ?? { skipPreflight: false };
    this.events = {
      onBeforeCreateInstruction: options.onBeforeCreateInstruction || noop,
      onCreateNeonAccountInstruction: options.onCreateNeonAccountInstruction || noop,
      onBeforeSignTransaction: options.onBeforeSignTransaction || noop,
      onBeforeNeonSign: options.onBeforeNeonSign || noop,
      onSuccessSign: options.onSuccessSign || noop,
      onErrorSign: options.onErrorSign || noop
    };
  }

  get erc20ForSPLContract(): Contract {
    return new this.web3.eth.Contract(erc20Abi as AbiItem[]);
  }

  get neonWrapperContract(): Contract {
    return new this.web3.eth.Contract(neonWrapperAbi as AbiItem[]);
  }

  neonWrapper2Contract(address: string): Contract {
    return new this.web3.eth.Contract(neonWrapper2Abi as AbiItem[], address);
  }

  get solana(): any {
    if ('solana' in window) {
      return window['solana'];
    }
    return {};
  }

  get solanaWalletPubkey(): PublicKey {
    return new PublicKey(this.solanaWalletAddress);
  }

  get solanaWalletSigner(): Account {
    return solanaWalletSigner(this.web3, this.solanaWalletPubkey, this.neonWalletAddress);
  }

  neonAccountAddress(neonWallet: string): [PublicKey, number] {
    return neonWalletProgramAddress(neonWallet, this.programId);
  }

  authAccountAddress(neonWallet: string, token: SPLToken): [PublicKey, number] {
    return authAccountAddress(neonWallet, this.programId, token);
  }

  async getNeonAccount(neonAssociatedKey: PublicKey): Promise<AccountInfo<Buffer> | null> {
    return this.connection.getAccountInfo(neonAssociatedKey);
  }

  createAccountV3Instruction(solanaWallet: PublicKey, neonWalletPDA: PublicKey, neonWallet: string): TransactionInstruction {
    return createAccountV3Instruction(solanaWallet, neonWalletPDA, this.programId, neonWallet);
  }

  getAssociatedTokenAddress(mintPubkey: PublicKey, walletPubkey: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(mintPubkey, walletPubkey);
  }

  approveDepositInstruction(walletPubkey: PublicKey, neonPDAPubkey: PublicKey, associatedTokenPubkey: PublicKey, amount: number | bigint): TransactionInstruction {
    return createApproveInstruction(associatedTokenPubkey, neonPDAPubkey, walletPubkey, amount);
  }

  createApproveSolanaData(solanaWallet: PublicKey, splToken: SPLToken, amount: Amount): string {
    const fullAmount = toFullAmount(amount, splToken.decimals);
    return this.erc20ForSPLContract.methods.approveSolana(solanaWallet.toBuffer(), fullAmount).encodeABI();
  }

  ethereumTransaction(amount: Amount, token: SPLToken): TransactionConfig {
    const solanaWallet = this.solanaWalletPubkey;
    return {
      to: token.address, // Required except during contract publications.
      from: this.neonWalletAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: this.createApproveSolanaData(solanaWallet, token, amount)
    };
  }

  emitFunction = (functionName?: Function, ...args: any[]): void => {
    if (typeof functionName === 'function') {
      functionName(...args);
    }
  };
}
