import { PublicKey } from '@solana/web3.js';
import { Account } from 'web3-core';
import Web3 from 'web3';
export declare function solanaWalletSigner(web3: Web3, solanaWallet: PublicKey, neonWallet: string): Account;
