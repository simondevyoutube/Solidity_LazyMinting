const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("NFT", () => {
  let nftContract = null;
  let owner = null;
  let addr1 = null;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const nftContractFactory = await ethers.getContractFactory("SimonDevNFT");
    nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
  });

  it("Deploy assigns ownership", async () => {
    expect(await nftContract.owner()).is.equal(owner.address);
  });

  it("Lazy Mint, succeeds, owner can sign", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await owner._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    await expect(nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: price}))
        .to.emit(nftContract, 'Transfer')
        .withArgs(ethers.constants.AddressZero, addr1.address, tokenID);
    expect(await nftContract.tokenURI(tokenID)).to.equal(uri);
    expect(await nftContract.ownerOf(tokenID)).to.equal(addr1.address);
  });

  it("Lazy Mint, succeeds, owner gets paid", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await owner._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    const completeTransaction = () => {
      return nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: price});
    };

    await expect(completeTransaction).to.changeEtherBalance(owner, price);
  });

  it("Lazy Mint, fails, non-owner cannot sign", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await addr1._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    await expect(nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: price}))
        .to.be.revertedWith('SimonDevNFT: Invalid signature');
  });

  it("Lazy Mint, fails, changed parameters", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await addr1._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    const changedParameters = {
      tokenID,
      price,
      uri: 'https://foo',
    };
    await expect(nftContract.connect(addr1).lazyMintNFT(changedParameters, signature, {value: ethers.utils.parseEther('0.1')}))
        .to.be.revertedWith('SimonDevNFT: Invalid signature');
  });

  it("Lazy Mint, fails, didn't pay enough", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await addr1._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    await expect(nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: ethers.utils.parseEther('0.2')}))
        .to.be.revertedWith('SimonDevNFT: Message value != price');
  });

  it("Lazy Mint, fails, owner cannot same token twice", async function () {
    const tokenID = 1;
    const price = ethers.utils.parseEther('0.1');
    const uri = 'https://FOO';
    const nftData = {
      tokenID,
      price,
      uri,
    };

    const signature = await owner._signTypedData(
      {
        name: 'SimonDev',
        version: '1.0',
        chainId: await owner.getChainId(),
        verifyingContract: nftContract.address,
      },
      {
        SignedNFTData: [
          {name: 'tokenID', type: 'uint256'},
          {name: 'price', type: 'uint256'},
          {name: 'uri', type: 'string'},
        ]
      },
      nftData
    );

    await expect(nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: price}))
        .to.emit(nftContract, 'Transfer')
        .withArgs(ethers.constants.AddressZero, addr1.address, tokenID);

    await expect(nftContract.connect(addr1).lazyMintNFT(nftData, signature, {value: price}))
        .to.be.revertedWith('ERC721: token already minted');
  });
});