import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { getNamedAccounts, deployments, upgrades, network, ethers } from "hardhat"
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } from "../helper-hardhat-config"
import { ContractUtil } from "../utils"
import { BigNumberish, formatEther, formatUnits, getBigInt, toBigInt, toNumber } from "ethers"
import { Receipt } from "hardhat-deploy/dist/types"
// import type { BigNumber } from "ethres/bignumber"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments

    const { deployer, simpleERC20Beneficiary } = await getNamedAccounts()
    log(`chain: ${network.name} - ${network.config.chainId}`)

    let balance = await hre.ethers.provider.getBalance(deployer)
    console.log(`Deploying ${deployer} balance: ${formatEther(balance)} block:  ${await hre.ethers.provider.getBlockNumber()}`)

    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

    const contractName = "GabbyMasterpiece"
    const params = ["0xb081F12fd300f54119273ADa93ec96Dfba8B73Cb", "GabbyMasterpiece", "GM", "https://apiv2.gabby.world/api/v1/metadata/masterpiece/"]

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

    const receipt = nft.receipt as Receipt
    const gasUsed = receipt.gasUsed as BigNumberish
    const cumulativeGasUsed = receipt.cumulativeGasUsed as BigNumberish

    console.log(receipt.effectiveGasPrice)

    console.log(`gasUsed: ${formatUnits(gasUsed._hex, 0)}`)
    console.log(`cumulativeGasUsed: ${formatUnits(cumulativeGasUsed._hex, 0)}`)

    return

    console.log("------------------------------------------------")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await ContractUtil.verify(nft.address, params)
    }
}
export default func
func.tags = ["masterpiece", "gabbyMasterpiece", "all"]
