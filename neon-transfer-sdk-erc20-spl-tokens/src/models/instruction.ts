export const enum EvmInstruction {
  CreateAccountV02 = 0x18, // 24
  CollectTreasure = 0x1e, // 30
  TransactionStepFromData = 0x20, //  32
  TransactionStepFromAccount = 0x21, //  33
  TransactionStepFromAccountNoChainId = 0x22, //  34
  CancelWithHash = 0x23, //  35
  HolderCreate = 0x24, //  36
  HolderDelete = 0x25, //  37
  HolderWrite = 0x26, //  38
  DepositV03 = 0x27, //  39 //TODO: check right instruction number https://www.notion.so/neonfoundation/Changes-inside-NeonEVM-0b9a7388cbea4e65a288c1486ee68e3b?pvs=4#10962597648a440ea80fa83aea23bca7
  CreateAccountV03 = 0x28, //  40 //TODO: removed 0x28 => 0x2D
  AccountCreateBalance = 0x30, // 48 //TODO: check right instruction number https://www.notion.so/neonfoundation/Changes-inside-NeonEVM-0b9a7388cbea4e65a288c1486ee68e3b?pvs=4#b3684e651d2e45d780bfc1869ed37ba3
  DepositToBalance = 0x31, // 49 //TODO: check right instruction number https://www.notion.so/neonfoundation/Changes-inside-NeonEVM-0b9a7388cbea4e65a288c1486ee68e3b?pvs=4#b3684e651d2e45d780bfc1869ed37ba3
  TransactionExecuteFromInstruction = 0x32, //  50, //TODO: check right instruction number https://www.notion.so/neonfoundation/Changes-inside-NeonEVM-0b9a7388cbea4e65a288c1486ee68e3b?pvs=4#81007f11d68f48c49494b2ff64ce64e9
}

export const enum AccountHex {
  SeedVersion = 0x03
}
