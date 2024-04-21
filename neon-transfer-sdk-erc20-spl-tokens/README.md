# Neon Transfer SDK implementation

We are using Neon transfer SDK and Neon EVM utiliy token (Park Pro Token) built using Open Zeppelin to enable:
- Effortless DeFi and NFT integration for a decentralized financial future.
- Securely send and redeem Solana and Ethereum tokens with an expiry for redemption.
- Purchase Ethereum based tokens using credit and debit cards, as well as various crypto assets for South Asian countries where the majority of tokens cannot be withdrawn from exchanges to wallets.
- Seamless management of fiat and crypto payment options across desktop and mobile platforms.
- User-friendly interface for convenient navigation and control over your digital assets.

We are developing a Neon EVM utiliy token (Park Pro Token) using Neon transfer SDK, Open Zeppelin and enabling Smart incentivization using both Ethereum and Solana, Gnosis Pay with QR code dapp, EtherCalc.

We are integrating the Park Pro Token with EtherCalc where we are maintaining a list of vehicle service providers (Ethercalc link of vehicle service providers: https://ethercalc.net/veg1fcob7fe3)

Demo Video: https://drive.google.com/drive/u/1/folders/1Z2sfjos3oJWJrxmbY_tw0mU1yvgQ0NA_


---

## Installation and setup

Firstly, install the package:

```sh
yarn add @neonevm/token-transfer
# or
npm install @neonevm/token-transfer
```

### For native

Upon installation, it is essential to provide certain mandatory properties when initializing a new instance to ensure proper functionality. When integrating this into your frontend application, it's necessary to grant Solana/Neon wallets access for signing and sending transactions across Solana and Neon EVM networks.


```javascript
const solanaWallet = `<Your Solana wallet public key>`;
const neonWallet = `<Your Neon wallet public address>`;
```

We employ the `evmParams` method from Neon EVM to obtain specific addresses and constants required for seamless operations.

Additional for Multi-token gas fee, we added new method (`nativeTokenList`) for getting native token for special NeonEvm chain. 

```javascript
const neonNeonEvmUrl = `https://devnet.neonevm.org`;
const solNeonEvmUrl = `https://devnet.neonevm.org/solana/sol`;
const solanaUrl = `https://api.devnet.solana.com`;
const neonProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: neonNeonEvmUrl, solanaRpcApi: solanaUrl });
const solProxyApi = new NeonProxyRpcApi({ neonProxyRpcApi: solNeonEvmUrl, solanaRpcApi: solanaUrl });
// ...
const [neonNativeToken, solNativeToken] = await neonProxyApi.nativeTokenList(); // get native tokens for chain networks
const neonProxyStatus = await neonProxyApi.evmParams(); // get evm params config
const solProxyStatus = await solProxyApi.evmParams();

// for NEON token native network
const neonChainId = Number(neonNativeToken.token_chain_id);
const neonTokenMint = new PublicKey(neonNativeToken.token_mint);
const neonEvmProgram = new PublicKey(neonProxyStatus.NEON_EVM_ID);

// for SOL token native network
const solChainId = Number(solNativeToken.token_chain_id);
const solTokenMint = new PublicKey(solNativeToken.token_mint);
const solEvmProgram = new PublicKey(solProxyStatus.NEON_EVM_ID);
```

Still, for testing you can use `NEON_TRANSFER_CONTRACT_DEVNET` or `NEON_TRANSFER_CONTRACT_MAINNET` constants. This objects contains snapshots with latest `neonProxyStatus` state. 

#### Transfer NEON transactions

To generate a transaction for transferring NEON from Solana to Neon EVM, utilize the functions found in the `neon-transfer.ts` file.

```javascript
const neonToken: SPLToken = {
  ...NEON_TOKEN_MODEL,
  address_spl: neonTokenMint.toBase58(),
  chainId: neonChainId
};
const solToken: SPLToken = {
  ...SOL_TOKEN_MODEL,
  address_spl: solTokenMint.toBase58(),
  chainId: solChainId
};

// for transfer NEON: Solana -> NeonEvm (NEON)
const transaction = await solanaNEONTransferTransaction(solanaWallet, neonWallet, neonEvmProgram, neonTokenMint, neonToken, amount, neonChainId); // Solana Transaction object
transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash; // Network blockhash
const signature = await sendSolanaTransaction(connection, transaction, [signer], false, { skipPreflight: false }); // method for sign and send transaction to network

// for transfer SOL: Solana -> NeonEvm (SOL)
const transaction = await solanaSOLTransferTransaction(solanaWallet, neonWallet, solEvmProgram, solTokenMint, neonToken, amount, solChainId); // Solana Transaction object
transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash; // Network blockhash
const signature = await sendSolanaTransaction(connection, transaction, [signer], false, { skipPreflight: false }); // method for sign and send transaction to network
```

And for transfer NEON from Neon EVM to Solana, you should known token contract address, you can look it in [this file](https://github.com/neonlabsorg/neon-client-transfer/blob/master/src/data/constants.ts).

```javascript
const tokenContract = NEON_TRANSFER_CONTRACT_DEVNET; // or SOL_TRANSFER_CONTRACT_DEVNET
const transaction = await neonNeonTransactionWeb3(web3, neonWallet, tokenContract, solanaWallet, amount); // Neon EVM Transaction object
const hash = await sendNeonTransaction(web3, transaction, neonWallet); // method for sign and send transaction to network
```

#### Transfer ERC20 transactions

When working with Devnet, Testnet, or Mainnet, different ERC20 tokens are utilized. We have compiled a [token-list](https://github.com/neonlabsorg/token-list) containing the tokens supported and available on Neon EVM. For further information, please refer to our [documentation](https://docs.neonfoundation.io/docs/tokens/token_list).

For transfer ERC20 tokens from Solana to Neon EVM, using this patterns:

```javascript
const token = tokenList[0];
const transaction = await neonTransferMintWeb3Transaction(connection, web3, proxyApi, proxyStatus, neonEvmProgram/* or solEvmProgram*/, solanaWallet, neonWallet, token, amount, neonChainId /*or solChainId*/);
transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
const signature = await sendSolanaTransaction(connection, transaction, [signer], true, { skipPreflight: false });
```

And for transfer ERC20 tokens from Neon EVM to Solana:

```javascript
const token = tokenList[0];
const mintPubkey = new PublicKey(token.address_spl);
const associatedToken = getAssociatedTokenAddressSync(mintPubkey, solanaWallet);
const solanaTransaction = createMintSolanaTransaction(solanaWallet, mintPubkey, associatedToken, proxyStatus);
solanaTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
const neonTransaction = await createMintNeonTransactionWeb3(web3, neonWallet.address, associatedToken, token, amount);
const signedSolanaTransaction = await sendSolanaTransaction(connection, solanaTransaction, [signer], true, { skipPreflight: false });
const signedNeonTransaction = await sendNeonTransaction(web3, neonTransaction, neonWallet);
```

Within the Neon Transfer codebase, we employ the [web3.js](https://web3js.readthedocs.io/en/v1.10.0/) library to streamline our code. However, if the situation demands, you can opt for alternatives such as [ethers.js](https://docs.ethers.org/v6/) or [WalletConnect](https://walletconnect.com/).

### For React

To incorporate it into your React App, please refer to our React Demo located in the `examples/react/neon-transfer-react` folder. Or see [live demo](https://codesandbox.io/s/neon-transfer-demo-z93nlj).

### For Testing

We have provided extra examples within the `src/__tests__/e2e` folder, intended for testing and debugging this library on both the Devnet Solana network and Neon EVM.

Run this command for `e2e` testing Neon Transfer code.

```sh
yarn test
# or
npm run test
```
