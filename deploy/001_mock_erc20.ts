import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, upgrades, network } from "hardhat"
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config"

import { ContractUtil } from "../utils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments

    const { deployer, simpleERC20Beneficiary } = await getNamedAccounts()
    log(`chain: ${network.name} - ${network.config.chainId}`)

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

    const contractName = "MockERC20"
    const params = ["mock erc20 token", "MT", 18]

    log("----------------------------------------------------")
    log(`Deploying ${contractName} and waiting for confirmations...`)

    const nft = await deploy(contractName, {
        from: deployer,
        args: params,
        log: true,
        autoMine: true,
        waitConfirmations: waitBlockConfirmations,
    })

    log("----------------------------------------------------")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await ContractUtil.verify(nft.address, params)
    }
}
export default func
func.tags = ["mockErc20"]
