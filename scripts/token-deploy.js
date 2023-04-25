const hre = require("hardhat");

async function main() {
    const Token = await hre.ethers.getContractFactory("ZOOToken");
    const token = await Token.deploy('100000000');

    await token.deployed();

    console.log("Token deployed to:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
