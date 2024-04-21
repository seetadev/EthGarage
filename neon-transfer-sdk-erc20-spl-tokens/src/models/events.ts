import { Cluster, Connection, PublicKey, SendOptions } from '@solana/web3.js';
import Web3 from 'web3';
import { NeonProxyRpcApi } from '../api';
import { NeonProgramStatus } from './api';

export interface InstructionEvents {
  onBeforeCreateInstruction?: Function;
  onCreateNeonAccountInstruction?: Function;
  onBeforeSignTransaction?: Function;
  onBeforeNeonSign?: Function;
  onSuccessSign?: Function;
  onErrorSign?: Function;
}

export interface InstructionParams extends InstructionEvents {
  solanaWalletAddress: PublicKey;
  neonWalletAddress: string;
  neonContractAddress: string;
  web3: Web3;
  proxyApi: NeonProxyRpcApi;
  proxyStatus: NeonProgramStatus;
  connection: Connection;
  network?: Cluster;
  solanaOptions?: SendOptions;
}
