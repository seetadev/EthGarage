import {
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { Buffer } from 'buffer';
import { Account, SignedTransaction, TransactionConfig } from 'web3-core';
import Web3 from 'web3';
import { numberTo64BitLittleEndian, toBytesInt32, toFullAmount } from '../utils';
import {
  Amount,
  ClaimInstructionResult,
  EvmInstruction,
  NeonEmulate,
  NeonProgramStatus,
  SolanaAccount,
  SPLToken
} from '../models';
import {
  COMPUTE_BUDGET_ID,
  NEON_COMPUTE_UNITS,
  NEON_HEAP_FRAME,
  NEON_STATUS_DEVNET_SNAPSHOT
} from '../data';
import { NeonProxyRpcApi } from '../api';
import {
  authAccountAddress,
  collateralPoolAddress,
  erc20ForSPLContractWeb3,
  neonBalanceProgramAddress,
  neonWalletProgramAddress,
  solanaWalletSigner
} from './utils';

export async function neonTransferMintWeb3Transaction(connection: Connection, web3: Web3, proxyApi: NeonProxyRpcApi, proxyStatus: NeonProgramStatus, neonEvmProgram: PublicKey, solanaWallet: PublicKey, neonWallet: string, splToken: SPLToken, amount: Amount, chainId: number): Promise<any> {
  const fullAmount = toFullAmount(amount, splToken.decimals);
  const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), solanaWallet);
  const climeData = climeTransactionDataWeb3(web3, associatedTokenAddress, neonWallet, fullAmount);
  const walletSigner = solanaWalletSigner(web3, solanaWallet, neonWallet);
  const signedTransaction = await neonClaimTransactionFromSigner(climeData, walletSigner, neonWallet, splToken);
  const { neonKeys, legacyAccounts } = await createClaimInstruction(proxyApi, signedTransaction);
  return neonTransferMintTransaction(connection, proxyStatus, neonEvmProgram, solanaWallet, neonWallet, walletSigner, neonKeys, legacyAccounts, signedTransaction, splToken, fullAmount, chainId);
}

export async function neonTransferMintTransaction(connection: Connection, proxyStatus: NeonProgramStatus, neonEvmProgram: PublicKey, solanaWallet: PublicKey, neonWallet: string, emulateSigner: Account, neonKeys: AccountMeta[], legacyAccounts: SolanaAccount[], neonTransaction: SignedTransaction, splToken: SPLToken, amount: bigint, chainId: number): Promise<Transaction> {
  const computedBudgetProgram = new PublicKey(COMPUTE_BUDGET_ID);
  const [delegatePDA] = authAccountAddress(emulateSigner.address, neonEvmProgram, splToken);
  const [neonWalletBalanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const [emulateSignerBalanceAddress] = neonBalanceProgramAddress(emulateSigner.address, neonEvmProgram, chainId);
  const neonWalletBalanceAccount = await connection.getAccountInfo(neonWalletBalanceAddress);
  const emulateSignerBalanceAccount = await connection.getAccountInfo(emulateSignerBalanceAddress);
  const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), solanaWallet);
  const transaction = new Transaction({ feePayer: solanaWallet });

  transaction.add(createComputeBudgetHeapFrameInstruction(computedBudgetProgram, proxyStatus));
  transaction.add(createApproveDepositInstruction(solanaWallet, delegatePDA, associatedTokenAddress, amount));

  if (!neonWalletBalanceAccount) {
    transaction.add(createAccountBalanceInstruction(solanaWallet, neonEvmProgram, neonWallet, chainId));
  }

  if (!emulateSignerBalanceAccount) {
    transaction.add(createAccountBalanceInstruction(solanaWallet, neonEvmProgram, emulateSigner.address, chainId));
  }

  for (const account of legacyAccounts) {
    const instruction = await createAccountBalanceForLegacyAccountInstruction(connection, account, solanaWallet, neonEvmProgram, chainId);
    if (instruction) {
      transaction.add(instruction);
    }
  }


  if (neonTransaction?.rawTransaction) {
    transaction.add(createExecFromDataInstructionV2(solanaWallet, neonWallet, neonEvmProgram, neonTransaction.rawTransaction, neonKeys, proxyStatus, chainId));
  }

  return transaction;
}

export function createComputeBudgetUtilsInstruction(programId: PublicKey, proxyStatus: NeonProgramStatus): TransactionInstruction {
  const a = Buffer.from([0x00]);
  const b = Buffer.from(toBytesInt32(parseInt(proxyStatus.NEON_COMPUTE_UNITS ?? NEON_COMPUTE_UNITS)));
  const c = Buffer.from(toBytesInt32(0));
  const data = Buffer.concat([a, b, c]);
  return new TransactionInstruction({ programId, data, keys: [] });
}

export function createComputeBudgetHeapFrameInstruction(programId: PublicKey, proxyStatus: NeonProgramStatus): TransactionInstruction {
  const a = Buffer.from([0x01]);
  const b = Buffer.from(toBytesInt32(parseInt(proxyStatus.NEON_HEAP_FRAME ?? NEON_HEAP_FRAME)));
  const data = Buffer.concat([a, b]);
  return new TransactionInstruction({ programId, data, keys: [] });
}

export function createApproveDepositInstruction(solanaWallet: PublicKey, neonPDAWallet: PublicKey, associatedToken: PublicKey, amount: number | bigint): TransactionInstruction {
  return createApproveInstruction(associatedToken, neonPDAWallet, solanaWallet, amount);
}

export function createAccountV3Instruction(solanaWallet: PublicKey, neonPDAWallet: PublicKey, neonEvmProgram: PublicKey, neonWallet: string): TransactionInstruction {
  const keys = [
    { pubkey: solanaWallet, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: neonPDAWallet, isSigner: false, isWritable: true }
  ];
  const a = Buffer.from([EvmInstruction.CreateAccountV03]);
  const b = Buffer.from(neonWallet.slice(2), 'hex');
  const data = Buffer.concat([a, b]);
  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export async function createAccountBalanceForLegacyAccountInstruction(connection: Connection, account: SolanaAccount, solanaWallet: PublicKey, neonEvmProgram: PublicKey, chainId: number): Promise<TransactionInstruction | null> {
  const accountAddress = new PublicKey(account.pubkey);
  const accountInfo = await connection.getAccountInfo(accountAddress);
  if (accountInfo) {
    const neonAddress = `0x${accountInfo?.data.slice(1, 21).toString('hex')}`;
    return createAccountBalanceInstruction(solanaWallet, neonEvmProgram, neonAddress, chainId);
  }
  return null!;
}

export function createAccountBalanceInstruction(solanaWallet: PublicKey, neonEvmProgram: PublicKey, neonWallet: string, chainId: number): TransactionInstruction {
  const [neonWalletAddress] = neonWalletProgramAddress(neonWallet, neonEvmProgram);
  const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const keys = [
    { pubkey: solanaWallet, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: balanceAddress, isSigner: false, isWritable: true },
    { pubkey: neonWalletAddress, isSigner: false, isWritable: true }
  ];
  const a = Buffer.from([EvmInstruction.AccountCreateBalance]);
  const b = Buffer.from(neonWallet.slice(2), 'hex');
  const c = numberTo64BitLittleEndian(chainId);
  const data = Buffer.concat([a, b, c]);
  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export function climeTransactionDataWeb3(web3: Web3, associatedToken: PublicKey, neonWallet: string, amount: Amount): string {
  const claimTo = erc20ForSPLContractWeb3(web3).methods.claimTo(associatedToken.toBuffer(), neonWallet, amount);
  return claimTo.encodeABI();
}

export async function neonClaimTransactionFromSigner(climeData: string, walletSigner: Account, neonWallet: string, splToken: SPLToken): Promise<SignedTransaction> {
  const transaction: TransactionConfig = {
    data: climeData,
    gas: `0x5F5E100`, // 100000000
    gasPrice: `0x0`,
    from: neonWallet,
    to: splToken.address // contract address
  };
  return walletSigner.signTransaction(transaction);
}

export function createClaimInstructionKeys(neonEmulate: NeonEmulate): ClaimInstructionResult {
  const legacyAccounts: SolanaAccount[] = [];
  const accountsMap = new Map<string, AccountMeta>();
  if (neonEmulate!) {
    const { accounts = [], solana_accounts = [] } = neonEmulate;
    for (const account of accounts) {
      const key = account['account'];
      accountsMap.set(key, { pubkey: new PublicKey(key), isSigner: false, isWritable: true });
      if (account['contract']) {
        const key = account['contract'];
        accountsMap.set(key, { pubkey: new PublicKey(key), isSigner: false, isWritable: true });
      }
    }
    for (const account of solana_accounts) {
      const { pubkey, is_legacy, is_writable } = account;
      accountsMap.set(pubkey, {
        pubkey: new PublicKey(pubkey),
        isSigner: false,
        isWritable: is_writable
      });
      if (is_legacy) {
        legacyAccounts.push(account);
      }
    }
  }
  return { neonKeys: Array.from(accountsMap.values()), legacyAccounts };
}

export async function createClaimInstruction(proxyApi: NeonProxyRpcApi, neonTransaction: SignedTransaction): Promise<ClaimInstructionResult> {
  if (neonTransaction.rawTransaction) {
    const neonEmulate: NeonEmulate = await proxyApi.neonEmulate([neonTransaction.rawTransaction.slice(2)]);
    return createClaimInstructionKeys(neonEmulate);
  }
  return { neonKeys: [], legacyAccounts: [], neonTransaction };
}

export function createExecFromDataInstruction(solanaWallet: PublicKey, neonPDAWallet: PublicKey, neonEvmProgram: PublicKey, neonRawTransaction: string, neonKeys: AccountMeta[], proxyStatus: NeonProgramStatus): TransactionInstruction {
  const count = Number(proxyStatus.NEON_POOL_COUNT);
  const treasuryPoolIndex = Math.floor(Math.random() * count) % count;
  const [treasuryPoolAddress] = collateralPoolAddress(neonEvmProgram, treasuryPoolIndex);
  const a = Buffer.from([EvmInstruction.TransactionExecuteFromInstruction]);
  const b = Buffer.from(toBytesInt32(treasuryPoolIndex));
  const c = Buffer.from(neonRawTransaction.slice(2), 'hex');
  const data = Buffer.concat([a, b, c]);
  const keys: AccountMeta[] = [
    { pubkey: solanaWallet, isSigner: true, isWritable: true },
    { pubkey: treasuryPoolAddress, isSigner: false, isWritable: true },
    { pubkey: neonPDAWallet, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: neonEvmProgram, isSigner: false, isWritable: false },
    ...neonKeys
  ];

  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export function createExecFromDataInstructionV2(solanaWallet: PublicKey, neonWallet: string, neonEvmProgram: PublicKey, neonRawTransaction: string, neonKeys: AccountMeta[], proxyStatus: NeonProgramStatus, chainId: number): TransactionInstruction {
  const count = Number(proxyStatus.NEON_POOL_COUNT ?? NEON_STATUS_DEVNET_SNAPSHOT.NEON_POOL_COUNT);
  const treasuryPoolIndex = Math.floor(Math.random() * count) % count;
  const [balanceAccount] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const [treasuryPoolAddress] = collateralPoolAddress(neonEvmProgram, treasuryPoolIndex);
  const a = Buffer.from([EvmInstruction.TransactionExecuteFromInstruction]);
  const b = Buffer.from(toBytesInt32(treasuryPoolIndex));
  const c = Buffer.from(neonRawTransaction.slice(2), 'hex');
  const data = Buffer.concat([a, b, c]);
  const keys: AccountMeta[] = [
    { pubkey: solanaWallet, isSigner: true, isWritable: true },
    { pubkey: treasuryPoolAddress, isSigner: false, isWritable: true },
    { pubkey: balanceAccount, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: true },
    ...neonKeys
  ];

  return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}

export async function createMintNeonTransactionWeb3(web3: Web3, neonWallet: string, associatedToken: PublicKey, splToken: SPLToken, amount: Amount, gasLimit = 5e4): Promise<TransactionConfig> {
  const data = mintNeonTransactionDataWeb3(web3, associatedToken, splToken, amount);
  const transaction = createMintNeonTransaction(neonWallet, splToken, data);
  transaction.gasPrice = await web3.eth.getGasPrice();
  transaction.gas = await web3.eth.estimateGas(transaction);
  transaction.nonce = (await web3.eth.getTransactionCount(neonWallet));
  // @ts-ignore
  transaction['gasLimit'] = transaction.gas > gasLimit ? transaction.gas + 1e4 : gasLimit;
  return transaction;
}

export function mintNeonTransactionDataWeb3(web3: Web3, associatedToken: PublicKey, splToken: SPLToken, amount: Amount): string {
  const fullAmount = toFullAmount(amount, splToken.decimals);
  return erc20ForSPLContractWeb3(web3).methods.transferSolana(associatedToken.toBuffer(), fullAmount).encodeABI();
}

export function createMintNeonTransaction(neonWallet: string, splToken: SPLToken, data: string): TransactionConfig {
  return { data, from: neonWallet, to: splToken.address, value: `0x0` };
}

export function createMintSolanaTransaction(solanaWallet: PublicKey, tokenMint: PublicKey, associatedToken: PublicKey, proxyStatus: NeonProgramStatus): Transaction {
  const computedBudgetProgram = new PublicKey(COMPUTE_BUDGET_ID);
  const transaction = new Transaction({ feePayer: solanaWallet });
  // transaction.add(createComputeBudgetUtilsInstruction(computedBudgetProgram, proxyStatus));
  transaction.add(createComputeBudgetHeapFrameInstruction(computedBudgetProgram, proxyStatus));
  transaction.add(createAssociatedTokenAccountInstruction(tokenMint, associatedToken, solanaWallet, solanaWallet));
  return transaction;
}

// #region Neon -> Solana
export function createAssociatedTokenAccountInstruction(tokenMint: PublicKey, associatedAccount: PublicKey, owner: PublicKey, payer: PublicKey, associatedProgramId: PublicKey = ASSOCIATED_TOKEN_PROGRAM_ID, programId: PublicKey = TOKEN_PROGRAM_ID): TransactionInstruction {
  const data = Buffer.from([0x01]);
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedAccount, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: tokenMint, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }];

  return new TransactionInstruction({ programId: associatedProgramId, keys, data });
}

export async function createWrapSOLTransaction(connection: Connection, solanaWallet: PublicKey, amount: Amount, splToken: SPLToken): Promise<Transaction> {
  const tokenMint = new PublicKey(splToken.address_spl);
  const lamports = toFullAmount(amount, splToken.decimals);
  const associatedToken = getAssociatedTokenAddressSync(tokenMint, solanaWallet);
  const wSOLAccount = await connection.getAccountInfo(associatedToken);

  const transaction = new Transaction({ feePayer: solanaWallet });
  const instructions: TransactionInstruction[] = [];

  if (!wSOLAccount) {
    instructions.push(createAssociatedTokenAccountInstruction(tokenMint, associatedToken, solanaWallet, solanaWallet));
  }

  instructions.push(SystemProgram.transfer({
    fromPubkey: solanaWallet,
    toPubkey: associatedToken,
    lamports
  }));
  instructions.push(createSyncNativeInstruction(associatedToken, TOKEN_PROGRAM_ID));
  transaction.add(...instructions);
  return transaction;
}

export async function createUnwrapSOLTransaction(connection: Connection, solanaWallet: PublicKey, splToken: SPLToken): Promise<Transaction> {
  const tokenMint = new PublicKey(splToken.address_spl);
  const associatedToken = getAssociatedTokenAddressSync(tokenMint, solanaWallet);
  const wSOLAccount = await connection.getAccountInfo(associatedToken);

  if (!wSOLAccount) {
    throw new Error(`Error: ${associatedToken.toBase58()} haven't created account...`);
  }

  const transaction = new Transaction({ feePayer: solanaWallet });
  const instructions: TransactionInstruction[] = [];
  instructions.push(createCloseAccountInstruction(associatedToken, solanaWallet, solanaWallet));
  transaction.add(...instructions);
  return transaction;
}

export async function createWrapAndTransferSOLTransactionWeb3(connection: Connection, web3: Web3, proxyApi: NeonProxyRpcApi, proxyStatus: NeonProgramStatus, neonEvmProgram: PublicKey, solanaWallet: PublicKey, neonWallet: string, splToken: SPLToken, amount: number, chainId = 111): Promise<Transaction> {
  const instructions: TransactionInstruction[] = [];
  const transaction: Transaction = new Transaction({ feePayer: solanaWallet });
  const tokenMint = new PublicKey(splToken.address_spl);
  const fullAmount = toFullAmount(amount, splToken.decimals);
  const associatedTokenAddress = getAssociatedTokenAddressSync(tokenMint, solanaWallet);
  const wSOLAccount = await connection.getAccountInfo(associatedTokenAddress);
  const climeData = climeTransactionDataWeb3(web3, associatedTokenAddress, neonWallet, fullAmount);
  const walletSigner = solanaWalletSigner(web3, solanaWallet, neonWallet);
  const signedTransaction = await neonClaimTransactionFromSigner(climeData, walletSigner, neonWallet, splToken);
  const { neonKeys, legacyAccounts } = await createClaimInstruction(proxyApi, signedTransaction);
  const mintTransaction = await neonTransferMintTransaction(connection, proxyStatus, neonEvmProgram, solanaWallet, neonWallet, walletSigner, neonKeys, legacyAccounts, signedTransaction, splToken, fullAmount, chainId);

  if (!wSOLAccount) {
    instructions.push(createAssociatedTokenAccountInstruction(tokenMint, associatedTokenAddress, solanaWallet, solanaWallet));
  }

  instructions.push(SystemProgram.transfer({
    fromPubkey: solanaWallet,
    toPubkey: associatedTokenAddress,
    lamports: fullAmount
  }));
  instructions.push(createSyncNativeInstruction(associatedTokenAddress, TOKEN_PROGRAM_ID));
  transaction.add(...instructions);
  transaction.add(...mintTransaction.instructions);

  return transaction;
}
