import { SHA256 } from 'crypto-js';
export function solanaWalletSigner(web3, solanaWallet, neonWallet) {
    const emulateSignerPrivateKey = `0x${SHA256(solanaWallet.toBase58() + neonWallet).toString()}`;
    return web3.eth.accounts.privateKeyToAccount(emulateSignerPrivateKey);
}
