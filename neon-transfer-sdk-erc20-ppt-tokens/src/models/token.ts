export interface SPLToken {
  address: string;
  address_spl: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface GasToken {
  token_name: string;
  token_mint: string;
  token_chain_id: `0x${string}`;
}

export type Amount = number | bigint | string;

export type NeonAddress = `0x${string}` | string;
