export function isValidHex(hex: string | number): boolean {
  const isHexStrict = /^(0x)?[0-9a-f]*$/i.test(hex.toString());
  if (!isHexStrict) {
    throw new Error(`Given value "${hex}" is not a valid hex string.`);
  }
  return isHexStrict;
}
