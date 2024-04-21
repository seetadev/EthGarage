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
exports.InstructionService = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("../../utils");
const data_1 = require("../../data");
const utils_2 = require("../utils");
const mint_transfer_1 = require("../mint-transfer");
const noop = new Function();
/**
 * @deprecated this code was deprecated and will remove in next releases.
 * Please use other methods from mint-transfer.ts and neon-transfer.ts files
 * For more examples see `examples` folder
 */
class InstructionService {
    get programId() {
        return new web3_js_1.PublicKey(this.proxyStatus.NEON_EVM_ID);
    }
    get tokenMint() {
        var _a;
        return new web3_js_1.PublicKey((_a = this.proxyStatus.NEON_TOKEN_MINT) !== null && _a !== void 0 ? _a : data_1.NEON_TOKEN_MINT_DEVNET);
    }
    constructor(options) {
        var _a;
        this.emitFunction = (functionName, ...args) => {
            if (typeof functionName === 'function') {
                functionName(...args);
            }
        };
        this.web3 = options.web3;
        this.proxyApi = options.proxyApi;
        this.proxyStatus = options.proxyStatus;
        this.solanaWalletAddress = options.solanaWalletAddress || '';
        this.neonWalletAddress = options.neonWalletAddress || '';
        this.neonContractAddress = options.neonContractAddress || '';
        this.connection = options.connection;
        this.solanaOptions = (_a = options.solanaOptions) !== null && _a !== void 0 ? _a : { skipPreflight: false };
        this.events = {
            onBeforeCreateInstruction: options.onBeforeCreateInstruction || noop,
            onCreateNeonAccountInstruction: options.onCreateNeonAccountInstruction || noop,
            onBeforeSignTransaction: options.onBeforeSignTransaction || noop,
            onBeforeNeonSign: options.onBeforeNeonSign || noop,
            onSuccessSign: options.onSuccessSign || noop,
            onErrorSign: options.onErrorSign || noop
        };
    }
    get erc20ForSPLContract() {
        return new this.web3.eth.Contract(data_1.erc20Abi);
    }
    get neonWrapperContract() {
        return new this.web3.eth.Contract(data_1.neonWrapperAbi);
    }
    neonWrapper2Contract(address) {
        return new this.web3.eth.Contract(data_1.neonWrapper2Abi, address);
    }
    get solana() {
        if ('solana' in window) {
            return window['solana'];
        }
        return {};
    }
    get solanaWalletPubkey() {
        return new web3_js_1.PublicKey(this.solanaWalletAddress);
    }
    get solanaWalletSigner() {
        return (0, utils_2.solanaWalletSigner)(this.web3, this.solanaWalletPubkey, this.neonWalletAddress);
    }
    neonAccountAddress(neonWallet) {
        return (0, utils_2.neonWalletProgramAddress)(neonWallet, this.programId);
    }
    authAccountAddress(neonWallet, token) {
        return (0, utils_2.authAccountAddress)(neonWallet, this.programId, token);
    }
    getNeonAccount(neonAssociatedKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connection.getAccountInfo(neonAssociatedKey);
        });
    }
    createAccountV3Instruction(solanaWallet, neonWalletPDA, neonWallet) {
        return (0, mint_transfer_1.createAccountV3Instruction)(solanaWallet, neonWalletPDA, this.programId, neonWallet);
    }
    getAssociatedTokenAddress(mintPubkey, walletPubkey) {
        return (0, spl_token_1.getAssociatedTokenAddressSync)(mintPubkey, walletPubkey);
    }
    approveDepositInstruction(walletPubkey, neonPDAPubkey, associatedTokenPubkey, amount) {
        return (0, spl_token_1.createApproveInstruction)(associatedTokenPubkey, neonPDAPubkey, walletPubkey, amount);
    }
    createApproveSolanaData(solanaWallet, splToken, amount) {
        const fullAmount = (0, utils_1.toFullAmount)(amount, splToken.decimals);
        return this.erc20ForSPLContract.methods.approveSolana(solanaWallet.toBuffer(), fullAmount).encodeABI();
    }
    ethereumTransaction(amount, token) {
        const solanaWallet = this.solanaWalletPubkey;
        return {
            to: token.address,
            from: this.neonWalletAddress,
            value: '0x00',
            data: this.createApproveSolanaData(solanaWallet, token, amount)
        };
    }
}
exports.InstructionService = InstructionService;
