var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TokenInstruction, transferInstructionData } from '@solana/spl-token';
import { toWei } from 'web3-utils';
import { numberTo64BitLittleEndian, toBigInt, toFullAmount } from '../utils';
import { NEON_TOKEN_DECIMALS } from '../data';
import { authorityPoolAddress, neonBalanceProgramAddress, neonWalletProgramAddress, neonWrapper2ContractWeb3, neonWrapperContractWeb3 } from './utils';
export function solanaNEONTransferTransaction(solanaWallet, neonWallet, neonEvmProgram, neonTokenMint, token, amount, chainId = 111, serviceWallet, rewardAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const neonToken = Object.assign(Object.assign({}, token), { decimals: Number(NEON_TOKEN_DECIMALS) });
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
    });
}
export function createNeonDepositToBalanceInstruction(chainId, solanaWallet, tokenAddress, neonWallet, neonEvmProgram, tokenMint, serviceWallet) {
    const [depositWallet] = authorityPoolAddress(neonEvmProgram);
    const [balanceAddress] = neonBalanceProgramAddress(neonWallet, neonEvmProgram, chainId);
    const [contractAddress] = neonWalletProgramAddress(neonWallet, neonEvmProgram);
    const poolAddress = getAssociatedTokenAddressSync(tokenMint, depositWallet, true);
    const keys = [
        { pubkey: tokenMint, isSigner: false, isWritable: true },
        { pubkey: tokenAddress, isSigner: false, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: balanceAddress, isSigner: false, isWritable: true },
        { pubkey: contractAddress, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    const a = Buffer.from([49 /* EvmInstruction.DepositToBalance */]);
    const b = Buffer.from(neonWallet.slice(2), 'hex');
    const c = numberTo64BitLittleEndian(chainId);
    const data = Buffer.concat([a, b, c]);
    return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}
export function createNeonDepositInstruction(solanaWallet, neonPDAWallet, depositWallet, neonWallet, neonEvmProgram, neonTokenMint, serviceWallet) {
    const solanaAssociatedTokenAddress = getAssociatedTokenAddressSync(neonTokenMint, solanaWallet);
    const poolKey = getAssociatedTokenAddressSync(neonTokenMint, depositWallet, true);
    const keys = [
        { pubkey: solanaAssociatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: poolKey, isSigner: false, isWritable: true },
        { pubkey: neonPDAWallet, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    const a = Buffer.from([39 /* EvmInstruction.DepositV03 */]);
    const b = Buffer.from(neonWallet.slice(2), 'hex');
    const data = Buffer.concat([a, b]);
    return new TransactionInstruction({ programId: neonEvmProgram, keys, data });
}
export function createNeonTransferInstruction(neonTokenMint, solanaWallet, serviceWallet, rewardAmount) {
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
export function neonTransactionDataWeb3(web3, solanaWallet) {
    return neonWrapperContractWeb3(web3).methods.withdraw(solanaWallet.toBuffer()).encodeABI();
}
export function wrappedNeonTransactionDataWeb3(web3, token, amount) {
    const value = toWei(amount.toString(), 'ether');
    const contract = neonWrapper2ContractWeb3(web3, token.address);
    return contract.methods.withdraw(value).encodeABI();
}
export function wrappedNeonTransaction(from, to, data) {
    const value = `0x0`;
    return { from, to, value, data };
}
export function neonNeonTransaction(from, to, amount, data) {
    const value = `0x${BigInt(toWei(amount.toString(), 'ether')).toString(16)}`;
    return { from, to, value, data };
}
export function neonNeonTransactionWeb3(web3, from, to, solanaWallet, amount, gasLimit = 5e4) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = neonTransactionDataWeb3(web3, solanaWallet);
        const transaction = neonNeonTransaction(from, to, amount, data);
        transaction.gasPrice = yield web3.eth.getGasPrice();
        transaction.gas = yield web3.eth.estimateGas(transaction);
        // @ts-ignore
        transaction['gasLimit'] = transaction.gas > gasLimit ? transaction.gas + 1e4 : gasLimit;
        return transaction;
    });
}
