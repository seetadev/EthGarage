import Big from 'big.js';
export function toBytesInt32(number, littleEndian = true) {
    const arrayBuffer = new ArrayBuffer(4); // an Int32 takes 4 bytes
    const dataView = new DataView(arrayBuffer);
    dataView.setUint32(0, number, littleEndian); // byteOffset = 0; litteEndian = false
    return arrayBuffer;
}
export function toFullAmount(amount, decimals) {
    const data = new Big(amount.toString()).times(Big(10).pow(decimals));
    return BigInt(data.toString());
}
export function toBigInt(amount) {
    const data = new Big(amount.toString());
    return BigInt(data.toString());
}
export function numberTo64BitLittleEndian(num) {
    const buffer = new ArrayBuffer(8); // 64 bits = 8 bytes
    const view = new DataView(buffer);
    // Split the number into high and low 32-bit parts
    const low = num % Math.pow(2, 32);
    const high = Math.floor(num / Math.pow(2, 32));
    view.setUint32(0, low, true); // true for little-endian
    view.setUint32(4, high, true); // high part is set after low part
    return new Uint8Array(buffer);
}
export function toU256BE(bigIntNumber) {
    if (bigIntNumber < BigInt(0) || bigIntNumber > BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')) {
        throw new Error('Number out of range for U256BE');
    }
    const buffer = new ArrayBuffer(32); // 256 bits = 32 bytes
    const view = new DataView(buffer);
    // Loop through each byte and set it from the start to maintain big-endian order
    for (let i = 0; i < 32; i++) {
        // Extract each byte of the BigInt number
        const byte = Number((bigIntNumber >> BigInt(8 * (31 - i))) & BigInt(0xFF));
        view.setUint8(i, byte);
    }
    return new Uint8Array(buffer);
}
