"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorityPoolAddress = exports.collateralPoolAddress = exports.authAccountAddress = exports.neonBalanceProgramAddress = exports.neonWalletProgramAddress = void 0;
const web3_js_1 = require("@solana/web3.js");
const buffer_1 = require("buffer");
const utils_1 = require("../../utils");
function neonWalletProgramAddress(etherKey, neonEvmProgram) {
    const keyBuffer = buffer_1.Buffer.from((0, utils_1.isValidHex)(etherKey) ? etherKey.replace(/^0x/i, '') : etherKey, 'hex');
    const seed = [new Uint8Array([3 /* AccountHex.SeedVersion */]), new Uint8Array(keyBuffer)];
    return web3_js_1.PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
exports.neonWalletProgramAddress = neonWalletProgramAddress;
function neonBalanceProgramAddress(etherKey, neonEvmProgram, chainId) {
    const keyBuffer = buffer_1.Buffer.from((0, utils_1.isValidHex)(etherKey) ? etherKey.replace(/^0x/i, '') : etherKey, 'hex');
    const chainIdBytes = (0, utils_1.toU256BE)(BigInt(chainId)); //chain_id as u256be
    const seed = [
        new Uint8Array([3 /* AccountHex.SeedVersion */]),
        new Uint8Array(keyBuffer),
        chainIdBytes
    ];
    return web3_js_1.PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
exports.neonBalanceProgramAddress = neonBalanceProgramAddress;
function authAccountAddress(neonWallet, neonEvmProgram, splToken) {
    const neonAccountAddressBytes = buffer_1.Buffer.concat([buffer_1.Buffer.alloc(12), buffer_1.Buffer.from((0, utils_1.isValidHex)(neonWallet) ? neonWallet.replace(/^0x/i, '') : neonWallet, 'hex')]);
    const neonContractAddressBytes = buffer_1.Buffer.from((0, utils_1.isValidHex)(splToken.address) ? splToken.address.replace(/^0x/i, '') : splToken.address, 'hex');
    const seed = [
        new Uint8Array([3 /* AccountHex.SeedVersion */]),
        new Uint8Array(buffer_1.Buffer.from('AUTH', 'utf-8')),
        new Uint8Array(neonContractAddressBytes),
        new Uint8Array(neonAccountAddressBytes)
    ];
    return web3_js_1.PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
exports.authAccountAddress = authAccountAddress;
function collateralPoolAddress(neonWalletPDA, collateralPoolIndex) {
    const a = buffer_1.Buffer.from('treasury_pool', 'utf8');
    const b = buffer_1.Buffer.from((0, utils_1.toBytesInt32)(collateralPoolIndex));
    return web3_js_1.PublicKey.findProgramAddressSync([a, b], neonWalletPDA);
}
exports.collateralPoolAddress = collateralPoolAddress;
function authorityPoolAddress(programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([new Uint8Array(buffer_1.Buffer.from('Deposit', 'utf-8'))], programId);
}
exports.authorityPoolAddress = authorityPoolAddress;
