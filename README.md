# Eth Garage
Track, trace and record spare parts inventory, repair work orders, invoices and receipts for vehicles using Sign Protocol, DeSoC using Farcaster on Gnosis Chain and Arbitrum SDK, analytics tools on Filecoin and Arbitrum Stylus Testnet and Web3 ecosystem tools on Avail.

# Blockchain Eco-system

## Avail 

We are integrating Avail’s Light Client features with zk Vehicle wallet that seamlessly works across key Ethereum L2 Blockchains and leverages Zero Knowledge Proofs for Crypto-transactions and Identity proofs.

- Android version at (please download tablet.apk): https://github.com/seetadev/EthGarage/blob/main/work-order-mgr-avail-da-layer/avail-lc-android-lib/avail-tablet-dapp.apk

- Lib integration at https://github.com/seetadev/EthGarage/tree/main/work-order-mgr-avail-da-layer/avail-lc-android-lib

- demo, screenshots at https://drive.google.com/drive/u/1/folders/19C_rphxhFje9zgcCKu54lBq7oQ7reKJP and https://drive.google.com/drive/u/1/folders/1Z2sfjos3oJWJrxmbY_tw0mU1yvgQ0NA_

We are also developing custom rollapps with Avail DA and tools to enable no code, low code analytics tooling using an open source analytics and visualization tool, namely Avail XLS, which enables tabulation, organization, collaboration, visualization, graphing and charting.

Link: https://github.com/seetadev/EthGarage/tree/main/work-order-mgr-avail-da-layer

Integration of AvailXLS with Ethercalc Analytics at https://ethercalc.net/veg1fcob7fe3

We are developing tools to enable tracing, monitoring and recording of repair invoices in a scalable manner across an entire supply chain for efficiency and sustainability and benefit the entire vehicle service eco-system on Arbitrum using Avail for data accessibility layer and Sign Protocol for verification, user security.

Link: https://github.com/seetadev/EthGarage/tree/main/work-order-mgr-avail-da-layer

Wish to share our Avail addresses:
[1] 5CMLgLMsgj6kbtXDaHZY19g2FzujSHGRn3oqmh1WEGh3K6hW 
[2] 5Dqyi6FbQBURFDAivKwLPSTkxv3fa4Uj4qfcd7pTe18FmCex  


## Sign Protocol

We are using Sign Protocol for -

Attestation Hub Contract for Vehicle Service and Repair Work Orders, Invoices and Reports: We are extending the Sign Protocol to develop the Attestation Hub smart contract for Vehicle Service and Repair Work Orders, Invoices and Reports. We wish to enable vehicle owners to use Sign Protocol for all their vehicle insurance-claim transaction needs and collaborating with Third Party administrators in case of any urgent requirements. 
Link: https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance and https://zk-validate.vercel.app/


We are also integrating EtherCalc OSS spreadsheet with the Sign Protocol to prepare a list of the verified vehicle service providers with the requisite attestations. Link: https://ethercalc.net/veg1fcob7fe3

We are extending EthSign's template for enabling authorization and signing of invoices and work orders in Eth garage's ecommerce dapp solution.

Link: https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance/eth-sign-forge-hardhat-vehicle and https://zk-validate.vercel.app/

We are developing Account Abstraction tools using Sign Protocol to support zk signing of the transaction and other cryptographic operations across multiple platforms and blockchains that improve the overall usability and interoperability.

Link: https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance and https://zk-validate.vercel.app/

We are developing Account Abstraction tools using Sign Protocol to support operations like sending DAI and USDC payment amounts, zk signing of the transaction and other cryptographic operations across multiple platforms and blockchains that improve the overall usability and interoperability.


## Arbitrum

We are using Arbitrum and Farcaster to develop Repair NFT badges and marketplace with NFT badges issued to Vehicle Service providers on completion of repair work/vehicle servicing built using Arbitrum Stylus programs in Rust. We are extending the starter template for writing Arbitrum Stylus programs in Rust using the stylus-sdk. It includes a Rust implementation of a basic counter Ethereum smart contract.
Demo Video at https://drive.google.com/drive/u/1/folders/1Z2sfjos3oJWJrxmbY_tw0mU1yvgQ0NA_

Screenshots at https://drive.google.com/drive/u/1/folders/1OFn5SvRZlEeH3nLuBxD3pbncHy36oDAA

Vercel Link for ZK Validation: https://zk-validate.vercel.app/

Please visit: https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance/repair-nft-stylus-arb and https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance/arb-stylus-erc20

Ethercalc integration with Arbitrum and Avail DA layer for preparing a list of verified service providers and for weekly insights on repair work orders: https://ethercalc.net/veg1fcob7fe3
Tablet dapp on Arbitrum at https://github.com/seetadev/EthGarage/blob/main/work-order-mgr-avail-da-layer/avail-lc-android-lib/avail-tablet-dapp.apk

Web3 Monitor Anywhere module on Arbitrum: For developers building cross-platform monitoring dapps on Arbitrum with low code OSS spreadsheet while retaining dapp core principles and flexibility. Please visit https://ethercalc.net/veg1fcob7fe3 and https://github.com/seetadev/EthGarage/tree/main/arb-sign-vehicle-maintenance


## Risc 0 

We are developing a KYC decentralized application using Risc0 ZKVM for vehicle owners and vehicle service providers that allows them to verify and mint their identity as an NFT enabling onchain identity verification with zero-knowledge proofs.

Link: https://github.com/seetadev/EthGarage/tree/main/risc0-foundry-zk-validate/zk-kyc-risc0-vehicle-owners-mechanic

The dapp leverages ID.me to generate a vehicle owner authentication token. The token includes a nonce that is associated with the vehicle owner's connected wallet address, employing principles from the OpenPubkey: Augmenting OpenID Connect with User held Signing Keys paper. The JWT's integrity is then verified within the guest using ID.me's public RS256 signing certificates. The guest then generates a cryptographic proof of the JWT's integrity and issues a receipt. This receipt, containing the SNARK, an obfuscated identifier, and the user's address, can be validated on the onchain for ERC721 token minting or other transactions, if valid.

Link: https://github.com/seetadev/EthGarage/tree/main/risc0-foundry-zk-validate

Vercel link for zk validation: https://zk-validate.vercel.app/

We are also using RISC Zero zkVM and submitting data to Avail DA for weekly work order insights at the vehicle repair/maintenance location. 
Tablet dapp using RISC Zero zkVM, Avail, Arbitrum at  https://github.com/seetadev/EthGarage/blob/main/work-order-mgr-avail-da-layer/avail-lc-android-lib/avail-tablet-dapp.apk
Link: https://github.com/seetadev/EthGarage/tree/main/work-order-mgr-avail-da-layer

We are also trying to implement XMTP Chat for vehicle owners and service administrators in a particular region using Risc0 ZKVM with CyberConnect functions. We are enabling interoperability of the Farcaster frames developed with OpenFrames and communicating the vehicle maintenance and billing/invoicing related messages on XMTP. Receipts can also be shared with vehicle owners via XMTP.


## Filecoin 

Filecoin IPC and Filecoin Virtual Machine (FVM) enables us to use building blocks exposed through interfaces, enabling the construction of incident archiving solutions. This improves better outcomes for vehicle maintenance, service and repair. We are using FVM and Filecoin IPC for:

Creating a Vehicle Service Ticket NFT on the FVM for NFC tags of service and repair providers to improve service/repair operations, decentralized NFT-based voting system for contract work by service providers, Votes are uploaded to IPFS with the most recent vote linking to one before.

Filecoin IPC to enable scalability and token bridge operations using ERC20 token supply across multiple platforms and blockchains that improve the overall usability and interoperability.

Decentralized NFT-based voting system for contract work for vehicle service & maintenance providers and companies. DAOs can issue NFTs to wallets based on service and maintenance performance and work completed, and the holders of these NFTs can create proposals and vote on other proposals whilst they have the NFTs of that contract work.

To develop and use composable blocks and ensure effective design, engineering and delivery of a decentralized solution for machine monitoring and incident management using Ethereum & Filecoin eco-system tools. Automated Workflow for decentralized voting for service providers and DAO.

Screenshots at https://drive.google.com/drive/u/1/folders/1mHgu4dbnVW_w6DmyFdEMse0G1MZlnKDc

Demo Video at https://drive.google.com/drive/u/1/folders/1Z2sfjos3oJWJrxmbY_tw0mU1yvgQ0NA_

Deployment of DataDAO contracts using FVM testnet and view at Filfox explorer. 

Automated Workflow for decentralized voting for service providers and DAOs:
DAOs create a RFP for providing service or maintenance on the dapp. Service providers can join a RFP by minting an NFT of that RFP. Service providers that have a certain RFP's NFT are eligible to create proposals and vote on them. Voting is gasless and the vote is stored on IPFS and Filecoin with the most recent vote linking to one before.


## Neon EVM  

We are developing a NeonVM utiliy token (Park Pro Token) using Neon transfer SDK, Open Zeppelin and enabling Smart incentivization using both Ethereum and Solana, Gnosis Pay with QR code dapp, EtherCalc.

We are integrating the Park Pro Token with EtherCalc where we are maintaining a list of vehicle service providers (Ethercalc link of vehicle service providers: https://ethercalc.net/veg1fcob7fe3)

Demo Video: https://drive.google.com/drive/u/1/folders/1Z2sfjos3oJWJrxmbY_tw0mU1yvgQ0NA_

We are using Neon transfer SDK and NeonVM utiliy token (Park Pro Token) to enable:
- Effortless DeFi and NFT integration for a decentralized financial future.
- Securely send and redeem Solana and Ethereum tokens with an expiry for redemption.
- Purchase Ethereum based tokens using credit and debit cards, as well as various crypto assets for South Asian countries where the majority of tokens cannot be withdrawn from exchanges to wallets.
- Seamless management of fiat and crypto payment options across desktop and mobile platforms.
- User-friendly interface for convenient navigation and control over your digital assets.


## Gnosis Chain 

Vehicle Repair and Service NFTs on Farcaster and Gnosis Chain enable:
- Enable hyperlocal vehicle service and repair delivery information.
- Enable QR code based blockchain payments at parking sites with support for key blockchain platforms.
- Enhance road safety through smart incentivization of incident reporting by citizens.

Farcaster frame ids: https://warpcast.com/~/developers/frames?url=https%3A%2F%2Fframes.neynar.com%2Ff%2F1369eae6%2F69ae0817 and https://warpcast.com/~/developers/frames?url=https%3A%2F%2Fframes.neynar.com%2Ff%2F1369eae6%2F69ae0817

We are developing a Gnosis blockchain utiliy token using Open Zepellin and enabling Smart incentivization using GHO stablecoin, Gnosis Pay with QR code dapp, EtherCalc.

Ethercalc link of vehicle service providers: https://ethercalc.net/veg1fcob7fe3

We are using Gnosis Pay to enable:
- Effortless DeFi and NFT integration for a decentralized financial future.
- Securely send and redeem Aave based GHO based stable coins with an expiry for redemption.
- Purchase Ethereum based tokens using credit and debit cards, as well as various crypto assets for South Asian countries where the majority of tokens cannot be withdrawn from exchanges to wallets.
- Seamless management of fiat and crypto payment options across desktop and mobile platforms.
- User-friendly interface for convenient navigation and control over your digital assets.




