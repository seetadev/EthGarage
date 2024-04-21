"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neonNeonTransactionWeb3 = exports.neonNeonTransaction = exports.wrappedNeonTransaction = exports.wrappedNeonTransactionDataWeb3 = exports.neonTransactionDataWeb3 = exports.createNeonTransferInstruction = exports.createNeonDepositInstruction = exports.createNeonDepositToBalanceInstruction = exports.solanaNEONTransferTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const web3_utils_1 = require("web3-utils");
const utils_1 = require("../utils");
const data_1 = require("../data");
const utils_2 = require("./utils");
function solanaNEONTransferTransaction(solanaWallet, neonWallet, neonEvmProgram, neonTokenMint, token, amount, chainId = 111, serviceWallet, rewardAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const neonToken = Object.assign(Object.assign({}, token), { decimals: Number(data_1.NEON_TOKEN_DECIMALS) });
        const [balanceAddress] = (0, utils_2.neonBalanceProgramAddress)(neonWallet, neonEvmProgram, chainId);
        const fullAmount = (0, utils_1.toFullAmount)(amount, neonToken.decimals);
        const associatedTokenAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(neonToken.address_spl), solanaWallet);
        const transaction = new web3_js_1.Transaction({ feePayer: solanaWallet });
        transaction.add((0, spl_token_1.createApproveInstruction)(associatedTokenAddress, balanceAddress, solanaWallet, fullAmount));
        transaction.add(createNeonDepositToBalanceInstruction(chainId, solanaWallet, associatedTokenAddress, neonWallet, neonEvmProgram, neonTokenMint, serviceWallet));
        if (serviceWallet && rewardAmount) {
            transaction.add(createNeonTransferInstruction(neonTokenMint, solanaWallet, serviceWallet, rewardAmount));
        }
        return transaction;
    });
}
exports.solanaNEONTransferTransaction = solanaNEONTransferTransaction;
function createNeonDepositToBalanceInstruction(chainId, solanaWallet, tokenAddress, neonWallet, neonEvmProgram, tokenMint, serviceWallet) {
    const [depositWallet] = (0, utils_2.authorityPoolAddress)(neonEvmProgram);
    const [balanceAddress] = (0, utils_2.neonBalanceProgramAddress)(neonWallet, neonEvmProgram, chainId);
    const [contractAddress] = (0, utils_2.neonWalletProgramAddress)(neonWallet, neonEvmProgram);
    const poolAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, depositWallet, true);
    const keys = [
        { pubkey: tokenMint, isSigner: false, isWritable: true },
        { pubkey: tokenAddress, isSigner: false, isWritable: true },
        { pubkey: poolAddress, isSigner: false, isWritable: true },
        { pubkey: balanceAddress, isSigner: false, isWritable: true },
        { pubkey: contractAddress, isSigner: false, isWritable: true },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true },
        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    const a = Buffer.from([49 /* EvmInstruction.DepositToBalance */]);
    const b = Buffer.from(neonWallet.slice(2), 'hex');
    const c = (0, utils_1.numberTo64BitLittleEndian)(chainId);
    const data = Buffer.concat([a, b, c]);
    return new web3_js_1.TransactionInstruction({ programId: neonEvmProgram, keys, data });
}
exports.createNeonDepositToBalanceInstruction = createNeonDepositToBalanceInstruction;
function createNeonDepositInstruction(solanaWallet, neonPDAWallet, depositWallet, neonWallet, neonEvmProgram, neonTokenMint, serviceWallet) {
    const solanaAssociatedTokenAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(neonTokenMint, solanaWallet);
    const poolKey = (0, spl_token_1.getAssociatedTokenAddressSync)(neonTokenMint, depositWallet, true);
    const keys = [
        { pubkey: solanaAssociatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: poolKey, isSigner: false, isWritable: true },
        { pubkey: neonPDAWallet, isSigner: false, isWritable: true },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: serviceWallet ? serviceWallet : solanaWallet, isSigner: true, isWritable: true },
        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false }
    ];
    const a = Buffer.from([39 /* EvmInstruction.DepositV03 */]);
    const b = Buffer.from(neonWallet.slice(2), 'hex');
    const data = Buffer.concat([a, b]);
    return new web3_js_1.TransactionInstruction({ programId: neonEvmProgram, keys, data });
}
exports.createNeonDepositInstruction = createNeonDepositInstruction;
function createNeonTransferInstruction(neonTokenMint, solanaWallet, serviceWallet, rewardAmount) {
    const from = (0, spl_token_1.getAssociatedTokenAddressSync)(neonTokenMint, solanaWallet, true);
    const to = (0, spl_token_1.getAssociatedTokenAddressSync)(neonTokenMint, serviceWallet, true);
    const fullAmount = (0, utils_1.toBigInt)(rewardAmount);
    const keys = [
        { pubkey: from, isSigner: false, isWritable: true },
        { pubkey: to, isSigner: false, isWritable: true },
        { pubkey: solanaWallet, isSigner: true, isWritable: false }
    ];
    const data = Buffer.alloc(spl_token_1.transferInstructionData.span);
    spl_token_1.transferInstructionData.encode({
        instruction: spl_token_1.TokenInstruction.Transfer,
        amount: fullAmount
    }, data);
    return new web3_js_1.TransactionInstruction({ programId: spl_token_1.TOKEN_PROGRAM_ID, keys, data });
}
exports.createNeonTransferInstruction = createNeonTransferInstruction;
function neonTransactionDataWeb3(web3, solanaWallet) {
    return (0, utils_2.neonWrapperContractWeb3)(web3).methods.withdraw(solanaWallet.toBuffer()).encodeABI();
}
exports.neonTransactionDataWeb3 = neonTransactionDataWeb3;
function wrappedNeonTransactionDataWeb3(web3, token, amount) {
    const value = (0, web3_utils_1.toWei)(amount.toString(), 'ether');
    const contract = (0, utils_2.neonWrapper2ContractWeb3)(web3, token.address);
    return contract.methods.withdraw(value).encodeABI();
}
exports.wrappedNeonTransactionDataWeb3 = wrappedNeonTransactionDataWeb3;
function wrappedNeonTransaction(from, to, data) {
    const value = `0x0`;
    return { from, to, value, data };
}
exports.wrappedNeonTransaction = wrappedNeonTransaction;
function neonNeonTransaction(from, to, amount, data) {
    const value = `0x${BigInt((0, web3_utils_1.toWei)(amount.toString(), 'ether')).toString(16)}`;
    return { from, to, value, data };
}
exports.neonNeonTransaction = neonNeonTransaction;
function neonNeonTransactionWeb3(web3, from, to, solanaWallet, amount, gasLimit = 5e4) {
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
exports.neonNeonTransactionWeb3 = neonNeonTransactionWeb3;
