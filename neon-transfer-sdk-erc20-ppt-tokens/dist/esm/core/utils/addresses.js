import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { isValidHex, toBytesInt32, toU256BE } from '../../utils';
export function neonWalletProgramAddress(etherKey, neonEvmProgram) {
    const keyBuffer = Buffer.from(isValidHex(etherKey) ? etherKey.replace(/^0x/i, '') : etherKey, 'hex');
    const seed = [new Uint8Array([3 /* AccountHex.SeedVersion */]), new Uint8Array(keyBuffer)];
    return PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
export function neonBalanceProgramAddress(etherKey, neonEvmProgram, chainId) {
    const keyBuffer = Buffer.from(isValidHex(etherKey) ? etherKey.replace(/^0x/i, '') : etherKey, 'hex');
    const chainIdBytes = toU256BE(BigInt(chainId)); //chain_id as u256be
    const seed = [
        new Uint8Array([3 /* AccountHex.SeedVersion */]),
        new Uint8Array(keyBuffer),
        chainIdBytes
    ];
    return PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
export function authAccountAddress(neonWallet, neonEvmProgram, splToken) {
    const neonAccountAddressBytes = Buffer.concat([Buffer.alloc(12), Buffer.from(isValidHex(neonWallet) ? neonWallet.replace(/^0x/i, '') : neonWallet, 'hex')]);
    const neonContractAddressBytes = Buffer.from(isValidHex(splToken.address) ? splToken.address.replace(/^0x/i, '') : splToken.address, 'hex');
    const seed = [
        new Uint8Array([3 /* AccountHex.SeedVersion */]),
        new Uint8Array(Buffer.from('AUTH', 'utf-8')),
        new Uint8Array(neonContractAddressBytes),
        new Uint8Array(neonAccountAddressBytes)
    ];
    return PublicKey.findProgramAddressSync(seed, neonEvmProgram);
}
export function collateralPoolAddress(neonWalletPDA, collateralPoolIndex) {
    const a = Buffer.from('treasury_pool', 'utf8');
    const b = Buffer.from(toBytesInt32(collateralPoolIndex));
    return PublicKey.findProgramAddressSync([a, b], neonWalletPDA);
}
export function authorityPoolAddress(programId) {
    return PublicKey.findProgramAddressSync([new Uint8Array(Buffer.from('Deposit', 'utf-8'))], programId);
}
