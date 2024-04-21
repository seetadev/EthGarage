"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solanaWalletSigner = void 0;
const crypto_js_1 = require("crypto-js");
function solanaWalletSigner(web3, solanaWallet, neonWallet) {
    const emulateSignerPrivateKey = `0x${(0, crypto_js_1.SHA256)(solanaWallet.toBase58() + neonWallet).toString()}`;
    return web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
}
exports.solanaWalletSigner = solanaWalletSigner;
