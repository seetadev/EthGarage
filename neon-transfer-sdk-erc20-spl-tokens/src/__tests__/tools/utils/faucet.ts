import { ChainId, SPLToken } from '../../../models';
import { post } from './crud';

require('dotenv').config({ path: `./src/__tests__/env/.env` });

const tokensData = require('token-list/tokenlist.json');
const FAUCET_URL = process.env.FAUSET_URL!;

export class FaucetDropper {
  public tokens: SPLToken[] = [];
  public supportedTokens: SPLToken[] = [];
  private _tokens: string[] = ['USDT', 'USDC'];
  private chainId: ChainId['id'];

  constructor(chainId: ChainId['id']) {
    this.chainId = chainId;
    this.tokens = (tokensData?.tokens as SPLToken[] ?? []).filter(t => t.chainId === this.chainId);
    this.supportedTokens = this.tokens.filter(t => this._tokens.includes(t.symbol));
  }

  async requestERC20(wallet: string, { address_spl }: SPLToken, amount: number): Promise<any> {
    return post(`${FAUCET_URL}/request_erc20`, { amount, wallet, address_spl });
  }

  async requestNeon(wallet: string, amount: number): Promise<any> {
    try {
      return await post(`${FAUCET_URL}/request_neon`, { amount, wallet });
    } catch (e) {
      return 0;
    }
  }
}
