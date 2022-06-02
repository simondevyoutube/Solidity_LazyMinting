const {ethers} = require("hardhat");


async function main() {
  [owner, addr1] = await ethers.getSigners();

  const nftContractFactory = await ethers.getContractFactory("SimonDevNFT");
  nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();

  console.log('NFT Contract: ', nftContract.address);
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
})