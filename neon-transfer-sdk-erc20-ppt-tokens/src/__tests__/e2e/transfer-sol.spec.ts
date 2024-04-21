import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Connection, Keypair, PublicKey, Signer } from '@solana/web3.js';
import { Account } from 'web3-core';
import Web3 from 'web3';
import { NeonProgramStatus, SPLToken } from '../../models';
import {
  createSplAccount,
  delay,
  FaucetDropper, getGasToken,
  getMultiTokenProxy,
  NEON_PRIVATE,
  neonBalance,
  neonSignature,
  PHANTOM_PRIVATE,
  sendNeonTransaction,
  sendSolanaTransaction,
  SOL_TOKEN_MODEL,
  solanaBalance,
  solanaSignature,
  splTokenBalance, toSigner
} from '../tools';
import { neonNeonTransactionWeb3, solanaSOLTransferTransaction } from '../../core';
import { NeonProxyRpcApi } from '../../api';
import { SOL_TRANSFER_CONTRACT_DEVNET } from '../../data';
import { itNeonTokenMint, itSolanaTokenSPL } from './erc20';

require('dotenv').config({ path: `./src/__tests__/env/.env` });
jest.setTimeout(12e4);

const CHAIN_ID = Number(process.env.CHAIN_ID);
const CHAIN_ID_SOL = Number(process.env.CHAIN_ID_SOL);
const SOLANA_URL = process.env.SOLANA_URL;
const SOL_PROXY_URL = `${process.env.NEON_URL}/solana/sol`;
const skipPreflight = true;
const chainId = CHAIN_ID_SOL;
const faucet = new FaucetDropper(CHAIN_ID);
const connection = new Connection(SOLANA_URL!, 'confirmed');
let signer: Signer;
let proxyRpc: NeonProxyRpcApi;
let proxyStatus: NeonProgramStatus;
let evmProgramAddress: PublicKey;
let tokenMintAddress: PublicKey;
let web3: Web3;
let solanaWallet: Keypair;
let neonWallet: Account;

beforeAll(async () => {
  const result = await getMultiTokenProxy(SOL_PROXY_URL, SOLANA_URL!);
  const token = getGasToken(result.tokensList, chainId);
  web3 = result.web3;
  proxyRpc = result.proxyRpc;
  proxyStatus = result.proxyStatus;
  evmProgramAddress = result.evmProgramAddress;
  tokenMintAddress = token.tokenMintAddress;
  solanaWallet = Keypair.fromSecretKey(PHANTOM_PRIVATE);
  neonWallet = web3.eth.accounts.privateKeyToAccount(NEON_PRIVATE);
  signer = toSigner(solanaWallet);
});

afterEach(async () => {
  await delay(5e3);
});

describe(`SOL Transfer tests`, () => {

  it(`Should transfer 0.1 SOL from Solana to NeonEVM (SOL)`, async () => {
    const amount = 0.1;
    const id = faucet.tokens.findIndex(i => i.symbol === 'wSOL');
    const solToken: SPLToken = { ...faucet.tokens[id], ...SOL_TOKEN_MODEL, chainId };
    await createSplAccount(connection, signer, solToken);
    const balanceBefore = (await solanaBalance(connection, solanaWallet.publicKey)).toNumber();
    console.log(`Balance: ${balanceBefore} ${solToken.symbol}`);
    try {
      const transaction = await solanaSOLTransferTransaction(connection, solanaWallet.publicKey, neonWallet.address, evmProgramAddress, tokenMintAddress, solToken, amount, chainId);
      transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const signature = await sendSolanaTransaction(connection, transaction, [signer], false, { skipPreflight });
      expect(signature.length).toBeGreaterThan(0);
      solanaSignature(`Signature`, signature, SOLANA_URL!);
      await delay(10e3);
      const balanceAfter = (await solanaBalance(connection, solanaWallet.publicKey)).toNumber();
      const balanceNeon = await neonBalance(web3, neonWallet.address);
      console.log(`Balance: ${balanceBefore} > ${balanceAfter} ${solToken.symbol} ==> ${balanceNeon} ${solToken.symbol} in NeonEVM`);
      expect(balanceAfter).toBeLessThan(balanceBefore);
    } catch (e) {
      console.log(e);
      expect(e instanceof Error ? e.message : '').toBe('');
    }
  });

  it(`Should transfer 0.1 SOL from NeonEVM (SOL) to Solana`, async () => {
    const amount = 0.1;
    const id = faucet.tokens.findIndex(i => i.symbol === 'wSOL');
    const solToken: SPLToken = { ...faucet.tokens[id], ...SOL_TOKEN_MODEL, chainId };
    try {
      const balanceBefore = await neonBalance(web3, neonWallet.address);
      const transaction = await neonNeonTransactionWeb3(web3, neonWallet.address, SOL_TRANSFER_CONTRACT_DEVNET, solanaWallet.publicKey, amount);
      const hash = await sendNeonTransaction(web3, transaction, neonWallet);
      neonSignature(`NeonEvm (SOL) signature`, hash);
      expect(hash.length).toBeGreaterThan(2);
      await delay(5e3);
      const balanceAfter = await neonBalance(web3, neonWallet.address);
      const balanceSPL = await splTokenBalance(connection, solanaWallet.publicKey, solToken);
      console.log(`Balance: ${balanceBefore} > ${balanceAfter} ${solToken.symbol} ==> ${balanceSPL?.uiAmount} ${solToken.symbol} in Solana`);
      expect(balanceAfter.toNumber()).toBeLessThan(balanceBefore.toNumber());
    } catch (e) {
      console.log(e);
      expect(e instanceof Error ? e.message : '').toBe('');
    }
  });

  faucet.supportedTokens.forEach(token => {
    it(`Should transfer 0.1 ${token.symbol} from Solana to NeonEVM (SOL)`, _ => {
      itSolanaTokenSPL(connection, web3, proxyRpc, proxyStatus, token, evmProgramAddress, solanaWallet, neonWallet, chainId, SOLANA_URL!).then(() => _());
    });

    it(`Should transfer 0.1 ${token.symbol} from NeonEVM (SOL) to Solana`, _ => {
      itNeonTokenMint(connection, web3, faucet, proxyStatus, token, solanaWallet, neonWallet, SOLANA_URL!).then(() => _());
    });
  });
});
