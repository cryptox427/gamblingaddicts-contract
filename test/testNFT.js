const chai = require("chai");
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { solidity } = require("ethereum-waffle");

chai.use(solidity);
const provider = waffle.provider;

let nftContract;
describe("Test of NFT contract", function () {
    before(async () => {
        const NFTContract = await ethers.getContractFactory("GamblingAddicts");
        nftContract = await NFTContract.deploy();
        await nftContract.deployed();

        await nftContract.setPresaleTimeStamp(await time.latestBlock());
        await nftContract.setPublicSaleTimeStamp(await time.latestBlock() + 2);

        await nftContract.setPresaleMintLimit(10);
    })

    it('should mint presale', async function () {
        const [owner, user1] = await ethers.getSigners();
        await nftContract.connect(user1).mintPresale(1, {value: ethers.utils.parseUnits("0.0")});
        expect(await nftContract.balanceOf(user1.address)).to.equal(1);
    });

    it('should mint public sale', async function () {
        const [owner, user1, user2] = await ethers.getSigners();
        await time.increase(10);
        await nftContract.setPublicSaleTimeStamp(await time.latestBlock());
        await nftContract.connect(user2).mintPublic(2, {value: ethers.utils.parseUnits("0.014")});
        expect(await nftContract.balanceOf(user2.address)).to.equal(2);
    });

    it('should set token uri', async function () {
        const tokenURI = "test.json";
        await nftContract.setTokenURI(1, tokenURI);
        expect(await nftContract.tokenURI(1)).to.equal(tokenURI);
    });

    it('should withdraw balance', async function () {
        const [owner, user1, user2] = await ethers.getSigners();
        const balance = await provider.getBalance(user1.address);
        await nftContract.setTreasuryWallet(user1.address);
        await nftContract.withdraw();
        expect(await provider.getBalance(user1.address)).to.greaterThan(balance);
    });

    it('should burn a token', async function () {
        const [owner, user1, user2] = await ethers.getSigners();
        await nftContract.burn(1);
        await expect(nftContract.ownerOf(1)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        expect(await nftContract.ownerOf(2)).to.equal(user2.address);
    });
})
