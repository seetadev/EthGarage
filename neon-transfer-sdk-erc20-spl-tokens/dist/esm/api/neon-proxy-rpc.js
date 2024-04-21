var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class NeonProxyRpcApi {
    constructor(params) {
        var _a, _b;
        this.neonProxyRpcApi = '';
        this.solanaRpcApi = '';
        this.neonProxyRpcApi = (_a = params.neonProxyRpcApi) !== null && _a !== void 0 ? _a : '';
        this.solanaRpcApi = (_b = params.solanaRpcApi) !== null && _b !== void 0 ? _b : '';
    }
    rpc(url, method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Date.now();
            const body = { id, jsonrpc: '2.0', method, params };
            console.log('POST', url, JSON.stringify(body));
            const response = yield fetch(url, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(body)
            });
            return yield response.json();
        });
    }
    proxy(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rpc(this.neonProxyRpcApi, method, params);
        });
    }
    solana(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rpc(this.solanaRpcApi, method, params);
        });
    }
    neonEmulate(params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.proxy('neon_emulate', params).then(d => d.result);
        });
    }
    evmParams() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.proxy('neon_getEvmParams', []).then(d => d.result);
        });
    }
    gasTokenList() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.proxy('neon_getGasTokenList', []).then(d => d.result);
        });
    }
    nativeTokenList() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.proxy('neon_getNativeTokenList', []).then(d => d.result);
        });
    }
}
