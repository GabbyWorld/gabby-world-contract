import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, upgrades, network, ethers } from "hardhat"
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } from "../helper-hardhat-config"
import { ContractUtil } from "../utils"
import { formatEther } from "ethers"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments

    const { deployer, simpleERC20Beneficiary } = await getNamedAccounts()
    log(`chain: ${network.name} - ${network.config.chainId}`)

    let balance = await hre.ethers.provider.getBalance(deployer)
    console.log(`Deploying ${deployer} balance: ${formatEther(balance)} block:  ${await hre.ethers.provider.getBlockNumber()}`)

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

    const contractName = "GabbyPrompt1155"
    const params = ["GabbyPrompt", "GP", "https://gabbyworld.com"]

    log("----------------------------------------------------")
    log(`Deploying ${contractName} and waiting for confirmations...`)

    const nft = await deploy(contractName, {
        from: deployer,
        args: params,
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: waitBlockConfirmations,
    })

    console.log("------------------------------------------------")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await ContractUtil.verify(nft.address, params)
    }
}
export default func
func.tags = ["prompt1155", "gabbyPrompt1155", "all"]
