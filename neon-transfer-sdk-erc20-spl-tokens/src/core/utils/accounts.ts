import { PublicKey } from '@solana/web3.js';
import { Account } from 'web3-core';
import { SHA256 } from 'crypto-js';
import Web3 from 'web3';

export function solanaWalletSigner(web3: Web3, solanaWallet: PublicKey, neonWallet: string): Account {
  const emulateSignerPrivateKey = `0x${SHA256(solanaWallet.toBase58() + neonWallet).toString()}`;
  return web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
}
