"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solanaTransactionLog = void 0;
const bs58_1 = require("bs58");
function solanaTransactionLog(transaction) {
    console.log(transaction.instructions.map(({ programId, keys, data }, index) => {
        return `[${index}] programId: ${programId.toBase58()}
keys:
${keys.map(k => `${k.pubkey.toBase58()} [${k.isSigner ? 'signer' : ''}${k.isSigner && k.isWritable ? ', ' : ''}${k.isWritable ? 'writer' : ''}]`).join('\n')}
data:
${(0, bs58_1.encode)(data)}
0x${Buffer.from(data).toString('hex')}
${JSON.stringify(data)}
------------------------------`;
    }).join('\n\n'));
}
exports.solanaTransactionLog = solanaTransactionLog;
