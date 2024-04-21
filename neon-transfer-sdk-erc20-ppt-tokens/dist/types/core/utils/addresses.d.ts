import { PublicKey } from '@solana/web3.js';
import { SPLToken } from '../../models';
export declare function neonWalletProgramAddress(etherKey: string, neonEvmProgram: PublicKey): [PublicKey, number];
export declare function neonBalanceProgramAddress(etherKey: string, neonEvmProgram: PublicKey, chainId: number): [PublicKey, number];
export declare function authAccountAddress(neonWallet: string, neonEvmProgram: PublicKey, splToken: SPLToken): [PublicKey, number];
export declare function collateralPoolAddress(neonWalletPDA: PublicKey, collateralPoolIndex: number): [PublicKey, number];
export declare function authorityPoolAddress(programId: PublicKey): [PublicKey, number];
