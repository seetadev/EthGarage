var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { toFullAmount } from '../../utils';
import { climeTransactionDataWeb3, createClaimInstruction, createComputeBudgetHeapFrameInstruction, createComputeBudgetUtilsInstruction, createExecFromDataInstruction, createMintNeonTransactionWeb3, createMintSolanaTransaction, createUnwrapSOLTransaction, createWrapSOLTransaction, neonClaimTransactionFromSigner, neonTransferMintTransaction } from '../mint-transfer';
import { collateralPoolAddress, solanaWalletSigner } from '../utils';
import { InstructionService } from './InstructionService';
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods in mint-transfer.ts file
 * For more examples see `examples` folder
 */
export class MintPortal extends InstructionService {
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
            catch (e) {
                this.emitFunction(events.onErrorSign, e);
            }
        });
    }
    // Neon -> Solana
    createSolanaTransfer(amount, splToken, events = this.events) {
        return __awaiter(this, void 0, void 0, function* () {
            const mintPubkey = new PublicKey(splToken.address_spl);
            const walletPubkey = this.solanaWalletPubkey;
            const associatedTokenPubkey = getAssociatedTokenAddressSync(mintPubkey, walletPubkey);
            const solanaTransaction = yield this.solanaTransferTransaction(walletPubkey, mintPubkey, associatedTokenPubkey);
            const neonTransaction = yield this.createNeonTransaction(this.neonWalletAddress, associatedTokenPubkey, splToken, amount);
            neonTransaction.nonce = yield this.web3.eth.getTransactionCount(this.neonWalletAddress);
            this.emitFunction(events.onBeforeSignTransaction);
            try {
                const signedSolanaTransaction = yield this.solana.signTransaction(solanaTransaction);
                const signature = yield this.connection.sendRawTransaction(signedSolanaTransaction.serialize(), this.solanaOptions);
                const { transactionHash } = yield this.web3.eth.sendTransaction(neonTransaction);
                this.emitFunction(events.onSuccessSign, signature, transactionHash);
            }
            catch (error) {
                this.emitFunction(events.onErrorSign, error);
            }
        });
    }
    neonTransferTransaction(amount, splToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullAmount = toFullAmount(amount, splToken.decimals);
            const walletSigner = yield solanaWalletSigner(this.web3, this.solanaWalletPubkey, this.neonWalletAddress);
            const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), this.solanaWalletPubkey);
            const climeData = climeTransactionDataWeb3(this.web3, associatedTokenAddress, this.neonWalletAddress, fullAmount);
            const signedTransaction = yield neonClaimTransactionFromSigner(climeData, walletSigner, this.neonWalletAddress, splToken);
            const { neonKeys, legacyAccounts } = yield createClaimInstruction(this.proxyApi, signedTransaction);
            const transaction = yield neonTransferMintTransaction(this.connection, this.proxyStatus, this.programId, this.solanaWalletPubkey, this.neonWalletAddress, walletSigner, neonKeys, legacyAccounts, signedTransaction, splToken, fullAmount, 111);
            transaction.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            return transaction;
        });
    }
    computeBudgetUtilsInstruction(programId) {
        return createComputeBudgetUtilsInstruction(programId, this.proxyStatus);
    }
    computeBudgetHeapFrameInstruction(programId) {
        return createComputeBudgetHeapFrameInstruction(programId, this.proxyStatus);
    }
    createClaimInstruction(owner, from, to, splToken, emulateSigner, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const nonce = yield this.web3.eth.getTransactionCount(emulateSigner.address);
            const fullAmount = toFullAmount(amount, splToken.decimals);
            const associatedTokenAddress = getAssociatedTokenAddressSync(new PublicKey(splToken.address_spl), this.solanaWalletAddress);
            const climeData = climeTransactionDataWeb3(this.web3, associatedTokenAddress, this.neonWalletAddress, fullAmount);
            const walletSigner = yield solanaWalletSigner(this.web3, this.solanaWalletAddress, this.neonWalletAddress);
            const signedTransaction = yield neonClaimTransactionFromSigner(climeData, walletSigner, this.neonWalletAddress, splToken);
            const { neonKeys, neonTransaction } = yield createClaimInstruction(this.proxyApi, signedTransaction);
            return { neonKeys, neonTransaction: signedTransaction, emulateSigner, nonce };
        });
    }
    makeTrExecFromDataIx(neonAddress, neonRawTransaction, neonKeys) {
        return createExecFromDataInstruction(this.solanaWalletPubkey, neonAddress, this.programId, neonRawTransaction, neonKeys, this.proxyStatus);
    }
    getCollateralPoolAddress(collateralPoolIndex) {
        return collateralPoolAddress(this.programId, collateralPoolIndex);
    }
    createNeonTransaction(neonWallet, solanaWallet, splToken, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return createMintNeonTransactionWeb3(this.web3, neonWallet, solanaWallet, splToken, amount);
        });
    }
    solanaTransferTransaction(walletPubkey, mintPubkey, associatedTokenPubkey) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = createMintSolanaTransaction(walletPubkey, mintPubkey, associatedTokenPubkey, this.proxyStatus);
            transaction.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            return transaction;
        });
    }
    // #region Neon -> Solana
    createAssociatedTokenAccountInstruction(associatedProgramId, programId, mint, associatedAccount, owner, payer) {
        return createAssociatedTokenAccountInstruction(mint, associatedAccount, owner, payer);
    }
    wrapSOLTransaction(amount, splToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield createWrapSOLTransaction(this.connection, this.solanaWalletPubkey, amount, splToken);
            transaction.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            return transaction;
        });
    }
    unwrapSOLTransaction(amount, splToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield createUnwrapSOLTransaction(this.connection, this.solanaWalletPubkey, splToken);
            transaction.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            return transaction;
        });
    }
}
