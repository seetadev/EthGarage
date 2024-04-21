"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHex = void 0;
function isValidHex(hex) {
    const isHexStrict = /^(0x)?[0-9a-f]*$/i.test(hex.toString());
    if (!isHexStrict) {
        throw new Error(`Given value "${hex}" is not a valid hex string.`);
    }
    return isHexStrict;
}
exports.isValidHex = isValidHex;
