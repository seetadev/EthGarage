import { readFileSync } from 'fs';
import { basename, join } from 'path';

const solc = require('solc');

export async function compile(contractPath: string): Promise<any> {
  const root = process.cwd();
  const content = readFileSync(join(root, 'src', contractPath), { encoding: 'utf-8' });
  const name = basename(contractPath);
  const input = {
    language: 'Solidity',
    sources: { [name]: { content } },
    settings: { outputSelection: { '*': { '*': ['*'] } } }
  };
  const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
  return tempFile['contracts'][name];
}
