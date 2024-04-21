import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Amount, NeonAddress, SPLToken } from '../models';
export declare function solanaSOLTransferTransaction(connection: Connection, solanaWallet: PublicKey, neonWallet: NeonAddress, neonEvmProgram: PublicKey, neonTokenMint: PublicKey, token: SPLToken, amount: Amount, chainId?: number): Promise<Transaction>;
