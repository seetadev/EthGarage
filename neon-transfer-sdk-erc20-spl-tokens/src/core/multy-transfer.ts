import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Amount, NeonAddress, SPLToken } from '../models';
import { neonBalanceProgramAddress } from './utils';
import { toFullAmount } from '../utils';
import { createNeonDepositToBalanceInstruction } from './neon-transfer';
import { createWrapSOLTransaction } from './mint-transfer';

export async function solanaSOLTransferTransaction(connection: Connection, solanaWallet: PublicKey, neonWallet: NeonAddress, neonEvmProgram: PublicKey, neonTokenMint: PublicKey, token: SPLToken, amount: Amount, chainId = 111): Promise<Transaction> {
  const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
  const fullAmount = toFullAmount(amount, token.decimals);
  const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(token.address_spl), solanaWallet);
  const transaction = await createWrapSOLTransaction(connection, solanaWallet, amount, token);

  transaction.add(createApproveInstruction(associatedTokenAddress, balanceAddress, solanaWallet, fullAmount));
  transaction.add(createNeonDepositToBalanceInstruction(chainId, solanaWallet, associatedTokenAddress, neonWallet, neonEvmProgram, neonTokenMint));

  return transaction;
}
