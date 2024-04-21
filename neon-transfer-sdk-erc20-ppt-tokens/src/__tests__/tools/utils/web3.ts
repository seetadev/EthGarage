import {
  AccountInfo,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SendOptions,
  Signer,
  TokenAmount,
  Transaction,
  TransactionSignature
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';
import { Account, TransactionConfig } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { Buffer } from 'buffer';
import Web3 from 'web3';
import Big from 'big.js';
import { erc20Abi, NEON_TOKEN_MINT_DECIMALS } from '../../../data';
import { SPLToken } from '../../../models';
import { solanaTransactionLog } from '../../../utils';
import { delay } from './delay';
import { compile } from './contract';

export function toSigner({ publicKey, secretKey }: Keypair): Signer {
  return { publicKey, secretKey };
}

export async function sendSolanaTransaction(connection: Connection, transaction: Transaction, signers: Signer[],
                                            confirm = false, options?: SendOptions): Promise<TransactionSignature> {
  transaction.sign(...signers);
  solanaTransactionLog(transaction);
  const signature = await connection.sendRawTransaction(transaction.serialize(), options);
  if (confirm) {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
  }
  return signature;
}

export async function sendNeonTransaction(web3: Web3, transaction: TransactionConfig, account: Account): Promise<string> {
  const signedTrx = await web3.eth.accounts.signTransaction(transaction, account.privateKey);
  return new Promise((resolve, reject) => {
    if (signedTrx?.rawTransaction) {
      web3.eth.sendSignedTransaction(signedTrx.rawTransaction, (error, hash) => {
        if (error) {
          reject(error);
        } else {
          resolve(hash);
        }
      });
    } else {
      reject('Unknown transaction');
    }
  });
}

export async function neonBalance(web3: Web3, address: string): Promise<Big> {
  const balance = await web3.eth.getBalance(address);
  return new Big(balance).div(Big(10).pow(NEON_TOKEN_MINT_DECIMALS));
}

export async function solanaBalance(connection: Connection, address: PublicKey): Promise<Big> {
  const balance = await connection.getBalance(address);
  return new Big(balance).div(LAMPORTS_PER_SOL);
}

export async function splTokenBalance(connection: Connection, walletPubkey: PublicKey, token: SPLToken): Promise<TokenAmount> {
  const mintAccount = new PublicKey(token.address_spl);
  const assocTokenAccountAddress = getAssociatedTokenAddressSync(mintAccount, walletPubkey);

  const response = await connection.getTokenAccountBalance(assocTokenAccountAddress);
  return response?.value;
}

export async function mintTokenBalance(web3: Web3, account: string, token: SPLToken, contractAbi: AbiItem[] = erc20Abi as AbiItem[]): Promise<number> {
  const tokenInstance = new web3.eth.Contract(contractAbi, token.address);
  const balance = await tokenInstance.methods.balanceOf(account).call();
  return balance / Math.pow(10, token.decimals);
}

export function solanaSignature(comment: string, signature: string, url: string = `https://api.devnet.solana.com`): void {
  let params: { [key: string]: string } = { cluster: 'custom', customUrl: url };
  switch (url) {
    case 'https://api.devnet.solana.com':
      params = { cluster: 'devnet' };
      break;
    case 'https://api.mainnet-beta.solana.com':
      params = { cluster: 'mainnet-beta' };
      break;
    case 'https://api.testnet.solana.com':
      params = { cluster: 'testnet' };
      break;
  }
  const urlParams = new URLSearchParams(params);
  console.log(`${comment}: ${signature}; url: https://explorer.solana.com/tx/${signature}?${urlParams.toString()}`);
}

export function neonSignature(comment: string, signature: string): void {
  console.log(`${comment}: ${signature}; url: https://devnet.neonscan.org/tx/${signature}`);
}

export async function createSplAccount(connection: Connection, signer: Signer, token: SPLToken): Promise<AccountInfo<Buffer>> {
  const solanaWallet = signer.publicKey;
  const tokenMint = new PublicKey(token.address_spl);
  const tokenAccount = getAssociatedTokenAddressSync(tokenMint, solanaWallet);
  let account = await connection.getAccountInfo(tokenAccount);
  if (!account) {
    const transaction = new Transaction();
    transaction.add(createAssociatedTokenAccountInstruction(solanaWallet, tokenAccount, solanaWallet, tokenMint));
    transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    const signature = await sendSolanaTransaction(connection, transaction, [signer], false, { skipPreflight: false });
    solanaSignature(`SPL Account created`, signature);
    await delay(2e3);
  }
  account = await connection.getAccountInfo(tokenAccount);
  return account!;
}

export async function deployContract(web3: Web3, contractPath: string, signer: Account): Promise<any> {
  try {
    console.log(`Attempting to deploy from account: ${signer.address}`);
    const { NeonToken } = await compile(contractPath);
    const data = NeonToken?.evm.bytecode.object;
    const abi = NeonToken.abi;
    const incrementer = new web3.eth.Contract(abi);
    const incrementerTx = incrementer.deploy({ data, arguments: [1] });
    const transaction: TransactionConfig = {
      from: signer.address,
      data: incrementerTx.encodeABI()
    };
    transaction.gas = await web3.eth.estimateGas(transaction);
    const signedTrx = await web3.eth.accounts.signTransaction(transaction, signer.privateKey);
    if (signedTrx?.rawTransaction) {
      const createReceipt = await web3.eth.sendSignedTransaction(signedTrx.rawTransaction);
      return { blockHash: createReceipt.blockHash, contractAddress: createReceipt.contractAddress };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
