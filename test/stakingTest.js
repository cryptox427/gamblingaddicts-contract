const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking of one nft", function () {
    it("Should stake an nft and console.log the reward for the first staking cycle", async function () {
        const [owner, addr1] = await ethers.getSigners();

        const deployer = owner.address;
        const nullAddress = "0x0000000000000000000000000000000000000000";
        const account1 = addr1.address;

        console.log('deployer, account1--', deployer, account1)

        /// factories
        const VirtualMonstersFactory = await ethers.getContractFactory("VirtualMonsters");
        const RewardTokenFactory = await ethers.getContractFactory("RewardToken");
        const StakingSystemFactory = await ethers.getContractFactory(
            "VirtualMonstersStaking"
        );

        /// @notice that the nft and the toke are being deployed

        const virtualMonsterContract = await VirtualMonstersFactory.deploy();
        const RewardTokenContract = await RewardTokenFactory.deploy();

        await virtualMonsterContract.deployed();
        await RewardTokenContract.deployed();

        // we use their address as parameters for the Staking system

        const StakingSystemContract = await StakingSystemFactory.deploy(
            virtualMonsterContract.address,
            RewardTokenContract.address
        );

        // setting approval for all in the nft contract to the staking system contract
        console.log((StakingSystemContract.address, account1, 0));
        await expect(
            virtualMonsterContract.setApprovalForAll(StakingSystemContract.address, true)
        )
            .to.emit(virtualMonsterContract, "ApprovalForAll")
            .withArgs(deployer, StakingSystemContract.address, true);

        console.log("StakingSystem deployed: ", StakingSystemContract.address);

        //mint 2 nfts

        await expect(virtualMonsterContract.safeMint(account1))
            .to.emit(virtualMonsterContract, "Transfer")
            .withArgs(nullAddress, account1, 1);

        await expect(virtualMonsterContract.safeMint(account1))
            .to.emit(virtualMonsterContract, "Transfer")
            .withArgs(nullAddress, account1, 2);

        await StakingSystemContract.initStaking();
        await StakingSystemContract.setTokensClaimable(true);

        //stake 1 token
        // signed by account1\

        // we need the staker to setApproval for all to the staking system contract
        await expect(
            virtualMonsterContract.connect(addr1).setApprovalForAll(
                StakingSystemContract.address,
                true
            )
        )
            .to.emit(virtualMonsterContract, "ApprovalForAll")
            .withArgs(account1, StakingSystemContract.address, true);

        await expect(StakingSystemContract.connect(addr1).stake(1))
            .to.emit(StakingSystemContract, "Staked")
            .withArgs(account1, 1);

        // look a way to increase time in this test



        await network.provider.send("evm_increaseTime", [200])
        await network.provider.send("evm_mine")

        console.log("Updating reward: ");
        await StakingSystemContract.connect(addr1).updateReward(account1);

        await StakingSystemContract.connect(addr1).claimReward(account1);

    });
});
