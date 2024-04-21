import { PublicKey } from '@solana/web3.js';
import { NeonProxyRpcApi } from '../../../api';
import { GasToken, GasTokenData, MultiTokenProxy } from '../../../models';
import { TOKEN_LIST_DEVNET_SNAPSHOT } from '../../../data';

export const W3 = require('web3');

export async function getMultiTokenProxy(proxyUrl: string, solanaUrl: string): Promise<MultiTokenProxy> {
  const proxyRpc = new NeonProxyRpcApi({ solanaRpcApi: solanaUrl, neonProxyRpcApi: proxyUrl });
  const proxyStatus = await proxyRpc.evmParams();
  const tokensList = (await proxyRpc.nativeTokenList()) || TOKEN_LIST_DEVNET_SNAPSHOT;
  const web3 = new W3(new W3.providers.HttpProvider(proxyUrl));
  const evmProgramAddress = new PublicKey(proxyStatus.NEON_EVM_ID);
  return { web3, proxyRpc, proxyStatus, tokensList, evmProgramAddress };
}

export function getGasToken(tokenList: GasToken[], chainId: number): GasTokenData {
  const gasToken = tokenList.find(i => parseInt(i.token_chain_id, 16) === chainId)!;
  const tokenMintAddress = new PublicKey(gasToken.token_mint);
  return { gasToken, tokenMintAddress };
}
