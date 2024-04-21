import {
  GasToken,
  NeonEmulate,
  NeonProgramStatus,
  RPCResponse,
  SettingsFormState
} from '../models';

export class NeonProxyRpcApi {
  neonProxyRpcApi = '';
  solanaRpcApi = '';

  constructor(params: SettingsFormState) {
    this.neonProxyRpcApi = params.neonProxyRpcApi ?? '';
    this.solanaRpcApi = params.solanaRpcApi ?? '';
  }

  async rpc<T>(url: string, method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    const id = Date.now();
    const body = { id, jsonrpc: '2.0', method, params };
    console.log('POST', url, JSON.stringify(body));
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(body)
    });
    return await response.json();
  }

  async proxy<T>(method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    return this.rpc<T>(this.neonProxyRpcApi, method, params);
  }

  async solana<T>(method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    return this.rpc<T>(this.solanaRpcApi, method, params);
  }

  async neonEmulate(params: string[] = []): Promise<NeonEmulate> {
    return this.proxy<NeonEmulate>('neon_emulate', params).then(d => d.result);
  }

  async evmParams(): Promise<NeonProgramStatus> {
    return this.proxy<NeonProgramStatus>('neon_getEvmParams', []).then(d => d.result);
  }

  async gasTokenList(): Promise<GasToken[]> {
    return this.proxy<GasToken[]>('neon_getGasTokenList', []).then(d => d.result);
  }

  async nativeTokenList(): Promise<GasToken[]> {
    return this.proxy<GasToken[]>('neon_getNativeTokenList', []).then(d => d.result);
  }
}
