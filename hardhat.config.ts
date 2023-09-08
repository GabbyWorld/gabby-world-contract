import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"
import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-ethers"
import "@typechain/hardhat"
import "@nomicfoundation/hardhat-foundry"
import "hardhat-deploy"
import "hardhat-deploy-ethers"

import { resolve } from "path"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { getChainConfig } from "./helper-hardhat-config"

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env"
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) })

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [
            {
                version: "0.8.18",
            },
            {
                version: "0.8.9",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            live: false,
            chainId: 31337,
            saveDeployments: true,
        },
        localhost: {
            blockGasLimit: 100000000000,
            live: false,
            chainId: 31337,
            saveDeployments: true,
        },

        loottest: getChainConfig(9088912),
        mainnet: getChainConfig(1),
        goerli: getChainConfig(5),
        sepolia: getChainConfig(11155111),
    },

    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            sepolia: ETHERSCAN_API_KEY,
            mainnet: ETHERSCAN_API_KEY,
        },
    },

    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        deployments: "./deployments",
        tests: "./test",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        feeCollector: {
            default: 1,
        },
    },

    mocha: {
        timeout: 200000,
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v6",
    },
}

export default config
