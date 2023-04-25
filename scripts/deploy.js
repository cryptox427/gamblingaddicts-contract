const {ethers} = require("hardhat");

async function main() {
  // const VirtualMonsters = await ethers.getContractFactory("VirtualMonsters");
  // const RewardToken = await ethers.getContractFactory("RewardToken");
  const VirtualMonstersStaking = await ethers.getContractFactory("VirtualMonstersStaking");
  // const virtualMosters = await VirtualMonsters.deploy();
  // const rewardToken = await RewardToken.deploy();

  // await virtualMosters.deployed();
  // console.log("VirtualMonsters deployed to:", virtualMosters.address);
  // await rewardToken.deployed();
  // console.log("RewardToken deployed to:", rewardToken.address);

  const virtualMonsterStaking = await VirtualMonstersStaking.deploy('0x3B9dF5a461DeEe0EA2A5491591ED66f3Cc55B439', '0x5Db9bd6543d493F8CAF870abA69F474de01231Ac');
  console.log("StakingContract deployed to:", virtualMonsterStaking.address);

  // await virtualMosters.setApprovalForAll(virtualMonsterStaking.address, true)
  // console.log('NFT approved');

  await virtualMonsterStaking.initStaking();
  console.log('Staking initialized');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
