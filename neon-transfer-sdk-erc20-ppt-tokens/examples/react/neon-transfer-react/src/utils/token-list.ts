import { SPLToken } from '@neonevm/token-transfer';
import tokenList from 'token-list/tokenlist.json';
import { CHAIN_ID } from './consts';

export const TOKEN_LIST: SPLToken[] = tokenList.tokens.filter((token) => token.chainId === CHAIN_ID) as SPLToken[];
