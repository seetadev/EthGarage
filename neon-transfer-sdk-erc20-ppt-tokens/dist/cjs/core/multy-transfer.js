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
exports.solanaSOLTransferTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const neon_transfer_1 = require("./neon-transfer");
const mint_transfer_1 = require("./mint-transfer");
function solanaSOLTransferTransaction(connection, solanaWallet, neonWallet, neonEvmProgram, neonTokenMint, token, amount, chainId = 111) {
    return __awaiter(this, void 0, void 0, function* () {
        const [balanceAddress] = (0, utils_1.neonBalanceProgramAddress)(neonWallet, neonEvmProgram, chainId);
        const fullAmount = (0, utils_2.toFullAmount)(amount, token.decimals);
        const associatedTokenAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(token.address_spl), solanaWallet);
        const transaction = yield (0, mint_transfer_1.createWrapSOLTransaction)(connection, solanaWallet, amount, token);
        transaction.add((0, spl_token_1.createApproveInstruction)(associatedTokenAddress, balanceAddress, solanaWallet, fullAmount));
        transaction.add((0, neon_transfer_1.createNeonDepositToBalanceInstruction)(chainId, solanaWallet, associatedTokenAddress, neonWallet, neonEvmProgram, neonTokenMint));
        return transaction;
    });
}
exports.solanaSOLTransferTransaction = solanaSOLTransferTransaction;
