import {HardhatUserConfig} from 'hardhat/config'
import {config as configENV} from 'dotenv'
import '@nomicfoundation/hardhat-foundry'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'solidity-docgen'
import 'hardhat-deploy'

if (process.env.NODE_ENV !== 'PRODUCTION') {
    configENV()
}

const config: HardhatUserConfig = {
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.8.24',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    networks: {
        mumbai: {
            url: 'https://rpc.ankr.com/polygon_mumbai',
            chainId: 80001,
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        polygon: {
            url: 'https://polygon-rpc.com',
            chainId: 137,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        zetachainTestnet: {
            chainId: 7001,
            url: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        zetachain: {
            chainId: 7000,
            url: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        opBnbTestnet: {
            chainId: 5611,
            url: 'https://opbnb-testnet-rpc.bnbchain.org',
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        opBnb: {
            chainId: 204,
            url: 'https://opbnb-mainnet-rpc.bnbchain.org',
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        },
        ethereum: {
            chainId: 1,
            url: process.env.ALCHEMY_ETH_RPC!,
            accounts: [process.env.PRIVATE_KEY!],
            saveDeployments: true,
            zksync: false
        }
    },
    etherscan: {
        apiKey: {
            polygon: process.env.POLYGONSCAN_KEY!,
            polygonMumbai: process.env.POLYGONSCAN_KEY!,
            mantaPacific: process.env.MANTAPACIFIC_KEY!,
            mantaPacificTestnet: process.env.MANTAPACIFIC_TEST_KEY!,
            avax: process.env.SNOWTRACE_KEY!,
            sepolia: process.env.ETHERSCAN_KEY!,
            mainnet: process.env.ETHERSCAN_KEY!,
            zetachainTestnet: process.env.ZETASCAN_API_KEY!,
            zetachain: process.env.ZETASCAN_API_KEY!
        },
        customChains: [
            {
                network: 'zetachainTestnet',
                chainId: 7001,
                urls: {
                    apiURL: 'https://zetachain-athens-3.blockscout.com/api',
                    browserURL: 'https://zetachain-athens-3.blockscout.com/'
                }
            },
            {
                network: 'zetachain',
                chainId: 7000,
                urls: {
                    apiURL: 'https://zetachain.blockscout.com/api',
                    browserURL: 'https://zetachain.blockscout.com/'
                }
            }
        ]
    },
    docgen: {
        pages: 'files',
        exclude: []
    }
}

export default config
