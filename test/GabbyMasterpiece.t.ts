import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ZeroAddress } from "ethers"
import { getNamedAccounts, deployments } from "hardhat"
import type { GabbyMasterpiece } from "../typechain"

const ContractName = "GabbyMasterpiece"
const ConstructorArgs = ["GabbyMasterpiece", "GM", "https://gabbyworld.com/"]

async function deployAndInitFixture() {
    let owner = (await getNamedAccounts()).deployer
    await deployments.fixture(["gabbyMasterpiece"])
}

describe("Test", function () {
    let signers: SignerWithAddress[], accounts: string[]
    let nft: GabbyMasterpiece
    beforeEach(async () => {
        signers = await ethers.getSigners()
        accounts = await Promise.all(signers.map((signer) => signer.getAddress()))
        // accounts = signers.map((item) => item.address)

        await loadFixture(deployAndInitFixture)
        nft = <GabbyMasterpiece>(<unknown>await ethers.getContract(ContractName))
    })

    it("base token URI", async function () {
        // await nft.setBaseURI("")
        // expect(await nft.baseURI()).to.equal("")
        const bytes = ethers.encodeBytes32String("xx")
        console.log(`base URI : ${await nft.baseURI()}`)
        console.log(`token URI : ${await nft.tokenURI(1)}`)
    })

    it("burn", async function () {
        await nft.mint(accounts[0])

        await nft.burn(1)

        await expect(nft.ownerOf(1)).to.be.revertedWith("ERC721: invalid token ID")
        await expect(nft.tokenURI(1)).to.be.revertedWith("ERC721: invalid token ID")
        // await expect(nft.tokenURI(1)).to.be.revertedWithCustomError(nft, "NonExistentToken")
    })

    describe("EIP-165 support", async function () {
        it("supports ERC165", async function () {
            expect(await nft.supportsInterface("0x01ffc9a7")).to.eq(true)
        })

        it("supports IERC721", async function () {
            expect(await nft.supportsInterface("0x80ac58cd")).to.eq(true)
        })

        it("supports ERC721Metadata", async function () {
            expect(await nft.supportsInterface("0x5b5e139f")).to.eq(true)
        })

        it("does not support ERC721Enumerable", async function () {
            expect(await nft.supportsInterface("0x780e9d63")).to.eq(true)
        })
    })

    describe("ERC721Metadata support", async function () {
        it("name", async function () {
            expect(await nft.name()).to.eq(ConstructorArgs[0])
        })

        it("symbol", async function () {
            expect(await nft.symbol()).to.eq(ConstructorArgs[1])
        })

        describe("baseURI", async function () {
            it("sends an empty URI by default", async function () {
                expect(await nft.baseURI()).to.eq(ConstructorArgs[2])
            })
        })
    })

    describe("tokenURI (ERC721Metadata)", async function () {
        describe("tokenURI", async function () {
            it("reverts when tokenId does not exist", async function () {
                await expect(nft.tokenURI(1)).to.be.revertedWith("ERC721: invalid token ID")
            })
        })
    })

    describe("mint", function () {
        it("mint", async function () {
            let account = accounts[0]
            let toeknURI = "tokenURI"

            await expect(nft.mint(account)).to.emit(nft, "Mint").withArgs(account, 1)

            expect(await nft.ownerOf(1)).to.equal(account)
            expect(await nft.balanceOf(account)).to.equal(1)

            expect(await nft.tokenURI(1)).to.equal(ConstructorArgs[2] + 1)

            expect(await nft.tokenOfOwnerByIndex(account, 0)).to.equal(1)

            await nft.tokenIdBatch(account)
        })

        it("should increment tokenIds for each new NFT", async function () {
            let account1 = accounts[0]
            let account2 = accounts[1]

            await nft.mint(account1)
            await nft.mint(account2)

            expect(await nft.ownerOf(1)).to.equal(account1)
            expect(await nft.ownerOf(2)).to.equal(account2)
        })
    })

    describe("transferFrom", function () {
        it("should successful transfer ", async function () {
            await nft.mint(signers[0])

            await expect(nft.transferFrom(accounts[0], accounts[1], 1)).to.emit(nft, "Transfer").withArgs(accounts[0], accounts[1], 1)
            expect(await nft.ownerOf(1)).to.equal(accounts[1])
        })

        it("should successful transfer after approval", async function () {
            await nft.mint(signers[0])

            await nft.approve(signers[1].address, 1)
            await nft.connect(signers[1]).transferFrom(accounts[0], accounts[2], 1)
            expect(await nft.ownerOf(1)).to.equal(accounts[2])
        })

        it("should revert when transferring NFT to zero address", async function () {
            let signer1 = signers[1]
            await nft.mint(signer1.address)
            await expect(nft.connect(signer1).transferFrom(signer1.address, ZeroAddress, 1)).to.be.revertedWith("ERC721: transfer to the zero address")
        })

        it("should revert when transferring NFT that is not owned", async function () {
            await nft.mint(accounts[0])

            await expect(nft.connect(signers[1]).transferFrom(accounts[0], accounts[2], 1)).to.be.revertedWith("ERC721: caller is not token owner or approved")
        })

        it("should revert when transferring without approval", async function () {
            await nft.mint(accounts[1])

            await expect(nft.connect(signers[2]).transferFrom(accounts[1], accounts[2], 1)).to.be.revertedWith("ERC721: caller is not token owner or approved")
        })

        it("should clear approval after transferring NFT", async function () {
            await nft.mint(accounts[0])

            await nft.approve(accounts[1], 1)
            await nft.connect(signers[1]).transferFrom(accounts[0], accounts[1], 1)

            expect(await nft.getApproved(1)).to.equal(ZeroAddress)
        })
    })
})
