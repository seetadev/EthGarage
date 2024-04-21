import { NeonProxyRpcApi } from '../api';
import { NeonProgramStatus } from '../models';
export declare const proxyStatus = "proxyStatus";
export declare function useProxyInfo(api: NeonProxyRpcApi): NeonProgramStatus;
