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
exports.NeonPortal = void 0;
const InstructionService_1 = require("./InstructionService");
const neon_transfer_1 = require("../neon-transfer");
const utils_1 = require("../utils");
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in neon-transfer.ts file
 * For more examples see `examples` folder
 */
class NeonPortal extends InstructionService_1.InstructionService {
    // Solana -> Neon
    createNeonTransfer(amount, splToken, events = this.events) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emitFunction(events.onBeforeCreateInstruction);
            const transaction = yield this.neonTransferTransaction(amount, splToken);
            this.emitFunction(events.onBeforeSignTransaction);
            try {
                const signedTransaction = yield this.solana.signTransaction(transaction);
                const signature = yield this.connection.sendRawTransaction(signedTransaction.serialize(), this.solanaOptions);
                this.emitFunction(events.onSuccessSign, signature);
            }
            catch (error) {
                this.emitFunction(events.onErrorSign, error);
            }
        });
    }
    // Neon -> Solana
    createSolanaTransfer(amount, splToken, events = this.events) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emitFunction(events.onBeforeCreateInstruction);
            const transaction = this.ethereumTransaction(amount, splToken);
            this.emitFunction(events.onBeforeSignTransaction);
            try {
                const neonTransaction = yield this.web3.eth.sendTransaction(transaction);
                this.emitFunction(events.onSuccessSign, undefined, neonTransaction.transactionHash);
            }
            catch (error) {
                this.emitFunction(events.onErrorSign, error);
            }
        });
    }
    neonTransferTransaction(amount, token, serviceWallet, rewardAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield (0, neon_transfer_1.solanaNEONTransferTransaction)(this.solanaWalletPubkey, this.neonWalletAddress, this.programId, this.tokenMint, token, amount, 111, serviceWallet, rewardAmount);
            transaction.recentBlockhash = (yield this.connection.getLatestBlockhash('finalized')).blockhash;
            return transaction;
        });
    }
    createDepositInstruction(solanaPubkey, neonPubkey, depositPubkey, neonWalletAddress, serviceWallet) {
        return (0, neon_transfer_1.createNeonDepositInstruction)(solanaPubkey, neonPubkey, depositPubkey, neonWalletAddress, this.programId, this.tokenMint, serviceWallet);
    }
    neonTransferInstruction(solanaWallet, serviceWallet, rewardAmount) {
        return (0, neon_transfer_1.createNeonTransferInstruction)(this.tokenMint, solanaWallet, serviceWallet, rewardAmount);
    }
    getAuthorityPoolAddress() {
        return (0, utils_1.authorityPoolAddress)(this.programId);
    }
    createWithdrawEthTransactionData() {
        return (0, neon_transfer_1.neonTransactionDataWeb3)(this.web3, this.solanaWalletPubkey);
    }
    ethereumTransaction(amount, token) {
        const from = this.neonWalletAddress;
        const to = this.neonContractAddress;
        const value = `0x${BigInt(this.web3.utils.toWei(amount.toString(), 'ether')).toString(16)}`;
        const data = this.createWithdrawEthTransactionData();
        return { from, to, value, data };
    }
    createWithdrawWNeonTransaction(amount, address) {
        const contract = this.neonWrapper2Contract(address);
        return contract.methods.withdraw(amount).encodeABI();
    }
    wNeonTransaction(amount, token) {
        const from = this.neonWalletAddress;
        const to = token.address;
        const value = `0x0`;
        const data = this.createWithdrawWNeonTransaction(this.web3.utils.toWei(amount.toString(), 'ether'), to);
        return { from, to, value, data };
    }
    neonTransaction(amount, token) {
        const from = this.neonWalletAddress;
        const to = token.address;
        const value = `0x${BigInt(this.web3.utils.toWei(amount.toString(), 'ether')).toString(16)}`;
        const data = this.createWithdrawEthTransactionData();
        return { from, to, value, data };
    }
}
exports.NeonPortal = NeonPortal;
