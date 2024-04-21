import { encode } from 'bs58';
export function solanaTransactionLog(transaction) {
    console.log(transaction.instructions.map(({ programId, keys, data }, index) => {
        return `[${index}] programId: ${programId.toBase58()}
keys:
${keys.map(k => `${k.pubkey.toBase58()} [${k.isSigner ? 'signer' : ''}${k.isSigner && k.isWritable ? ', ' : ''}${k.isWritable ? 'writer' : ''}]`).join('\n')}
data:
${encode(data)}
0x${Buffer.from(data).toString('hex')}
${JSON.stringify(data)}
------------------------------`;
    }).join('\n\n'));
}
