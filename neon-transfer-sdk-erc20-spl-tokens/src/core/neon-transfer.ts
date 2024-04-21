import { Amount, EvmInstruction, NeonAddress, SPLToken } from '../models';
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  createApproveInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TokenInstruction,
  transferInstructionData
} from '@solana/spl-token';
import { TransactionConfig } from 'web3-core';
import { toWei } from 'web3-utils';
import Web3 from 'web3';
import { numberTo64BitLittleEndian, toBigInt, toFullAmount } from '../utils';
import { NEON_TOKEN_DECIMALS } from '../data';
import {
  authorityPoolAddress,
  neonBalanceProgramAddress,
  neonWalletProgramAddress,
  neonWrapper2ContractWeb3,
  neonWrapperContractWeb3
} from './utils';

export async function solanaNEONTransferTransaction(solanaWallet: PublicKey, neonWallet: NeonAddress, neonEvmProgram: PublicKey, neonTokenMint: PublicKey, token: SPLToken, amount: Amount, chainId = 111, serviceWallet?: PublicKey, rewardAmount?: Amount): Promise<Transaction> {
  const neonToken: SPLToken = { ...token, decimals: Number(NEON_TOKEN_DECIMALS) };
  const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const fullAmount = toFullAmount(amount, neonToken.decimals);
  const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(neonToken.address_spl), solanaWallet);
  const transaction = new Transaction({ feePayer: solanaWallet });

  transaction.add(createApproveInstruction(associatedTokenAddress, balanceAddress, solanaWallet, fullAmount));
  transaction.add(createNeonDepositToBalanceInstruction(chainId, solanaWallet, associatedTokenAddress, neonWallet, neonEvmProgram, neonTokenMint, serviceWallet));

  if (serviceWallet && rewardAmount) {
    transaction.add(createNeonTransferInstruction(neonTokenMint, solanaWallet, serviceWallet, rewardAmount));
  }

  return transaction;
}

export function createNeonDepositToBalanceInstruction(chainId: number, solanaWallet: PublicKey, tokenAddress: PublicKey, neonWallet: string, neonEvmProgram: PublicKey, tokenMint: PublicKey, serviceWallet?: PublicKey): TransactionInstruction {
  const [depositWallet] = authorityPoolAddress(neonEvmProgram);
  const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const [contractAddress] = neonWalletProgramAddress(neonWallet, neonEvmProgram);
  const poolAddress = getAssociatedTokenAddressSync(tokenMint, depositWallet, true);
  const keys = [
    { pubkey: tokenMint, isSigner: false, isWritable: true }, // mint address
    { pubkey: tokenAddress, isSigner: false, isWritable: true }, // source
    { pubkey: poolAddress, isSigner: false, isWritable: true }, // pool key
    { pubkey: balanceAddress, isSigner: false, isWritable: true },
    { pubkey: contractAddress, isSigner: false, isWritable: true }, // contract_account
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true }, // operator
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];

  const a = Buffer.from([EvmInstruction.DepositToBalance]);
  const b = Buffer.from(neonWallet.slice(2), 'hex');
  const c = numberTo64BitLittleEndian(chainId);
  const data = Buffer.concat([a, b, c]);
  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export function createNeonDepositInstruction(solanaWallet: PublicKey, neonPDAWallet: PublicKey, depositWallet: PublicKey, neonWallet: string, neonEvmProgram: PublicKey, neonTokenMint: PublicKey, serviceWallet?: PublicKey): TransactionInstruction {
  const solanaAssociatedTokenAddress = getAssociatedTokenAddressSync(neonTokenMint, solanaWallet);
  const poolKey = getAssociatedTokenAddressSync(neonTokenMint, depositWallet, true);
  const keys = [
    { pubkey: solanaAssociatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: poolKey, isSigner: false, isWritable: true },
    { pubkey: neonPDAWallet, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true }, // operator
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
  ];

  const a = Buffer.from([EvmInstruction.DepositV03]);
  const b = Buffer.from(neonWallet.slice(2), 'hex');
  const data = Buffer.concat([a, b]);
  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export function createNeonTransferInstruction(neonTokenMint: PublicKey, solanaWallet: PublicKey, serviceWallet: PublicKey, rewardAmount: Amount): TransactionInstruction {
  const from = getAssociatedTokenAddressSync(neonTokenMint, solanaWallet, true);
  const to = getAssociatedTokenAddressSync(neonTokenMint, serviceWallet, true);
  const fullAmount = toBigInt(rewardAmount);
  const keys = [
    { pubkey: from, isSigner: false, isWritable: true },
    { pubkey: to, isSigner: false, isWritable: true },
    { pubkey: solanaWallet, isSigner: true, isWritable: false }
  ];
  const data = Buffer.alloc(transferInstructionData.span);
  transferInstructionData.encode({
    instruction: TokenInstruction.Transfer,
    amount: fullAmount
  }, data);
  return new TransactionInstruction({ programId: TOKEN_PROGRAM_ID, keys, data });
}

export function neonTransactionDataWeb3(web3: Web3, solanaWallet: PublicKey): string {
  return neonWrapperContractWeb3(web3).methods.withdraw(solanaWallet.toBuffer()).encodeABI();
}

export function wrappedNeonTransactionDataWeb3(web3: Web3, token: SPLToken, amount: Amount): string {
  const value = toWei(amount.toString(), 'ether');
  const contract = neonWrapper2ContractWeb3(web3, token.address);
  return contract.methods.withdraw(value).encodeABI();
}

export function wrappedNeonTransaction(from: string, to: string, data: string): TransactionConfig {
  const value = `0x0`;
  return { from, to, value, data };
}

export function neonNeonTransaction(from: string, to: string, amount: Amount, data: string): TransactionConfig {
  const value = `0x${BigInt(toWei(amount.toString(), 'ether')).toString(16)}`;
  return { from, to, value, data };
}

export async function neonNeonTransactionWeb3(web3: Web3, from: string, to: string, solanaWallet: PublicKey, amount: Amount, gasLimit = 5e4): Promise<TransactionConfig> {
  const data = neonTransactionDataWeb3(web3, solanaWallet);
  const transaction = neonNeonTransaction(from, to, amount, data);
  transaction.gasPrice = await web3.eth.getGasPrice();
  transaction.gas = await web3.eth.estimateGas(transaction);
  // @ts-ignore
  transaction['gasLimit'] = transaction.gas > gasLimit ? transaction.gas + 1e4 : gasLimit;
  return transaction;
}
