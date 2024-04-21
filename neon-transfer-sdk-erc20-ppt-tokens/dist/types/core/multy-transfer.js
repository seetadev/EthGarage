var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { neonBalanceProgramAddress } from './utils';
import { toFullAmount } from '../utils';
import { createNeonDepositToBalanceInstruction } from './neon-transfer';
import { createWrapSOLTransaction } from './mint-transfer';
export function solanaSOLTransferTransaction(connection, solanaWallet, neonWallet, neonEvmProgram, neonTokenMint, token, amount, chainId = 111) {
    return __awaiter(this, void 0, void 0, function* () {
        const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
        const fullAmount = toFullAmount(amount, token.decimals);
        const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(token.address_spl), solanaWallet);
        const transaction = yield createWrapSOLTransaction(connection, solanaWallet, amount, token);
        transaction.add(createApproveInstruction(associatedTokenAddress, balanceAddress, solanaWallet, fullAmount));
        transaction.add(createNeonDepositToBalanceInstruction(chainId, solanaWallet, associatedTokenAddress, neonWallet, neonEvmProgram, neonTokenMint));
        return transaction;
    });
}
