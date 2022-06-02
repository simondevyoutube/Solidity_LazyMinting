

const NFTS = [
  {
    signature: '0xe9ec4377ac5d1453e19ea2ddbb9045431c3554f9d41fefd91d714429e331b89865970f56036562c4125c21348677f9380df27c7429a891a790affdfe417604211b',
    data: {
      tokenID: 1,
      price: ethers.utils.parseEther('0.01'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmfKcU2r8Bp9DzoYc7cNHNqiCgdTJgwzTUUgbRcCmUJbDs',
    },
  },
  {
    signature: '0x7edcbcd6b920a68ca98bed879f86a94e81a8a22633436351b2791f281836a1d321b079b057683cf56d9176fe5cc7787f941f7cfe7666c45dd9ad8cfbc79a61b51c',
    data: {
      tokenID: 2,
      price: ethers.utils.parseEther('0.02'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmZF5tCLfb4DZVeKV4eYfPSB8jbR2Mo7qfxqir1KqsVMvX',
    },
  },
  {
    signature: '0x4f08d44f5e2d838e829b7c60ea6993a21240a9acffbb8abe0c754bdc6b60ac8114a32d5b928e12a05b0422ff973f6e05e9a70e9d740211f45081a0f22690364d1b',
    data: {
      tokenID: 3,
      price: ethers.utils.parseEther('0.03'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmS4cvRgzkXPiTCKtrRLD21KEZQfPB1HMKEAebhPTpw2Xd',
    },
  },
  {
    signature: '0x649ec6254c85a05b79dad44abbb7b4a16ed97aaa27498437df2be2eb5d0cef8536f082492f12f5505eb1a34bf1efc96a00d6f4e9dd054c3bb927c0002e1971d71b',
    data: {
      tokenID: 4,
      price: ethers.utils.parseEther('0.04'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmPoTkgzMTfpVqi4uWt6H6k89F7sWeje3m4Qub54f89WSz',
    },
  },
  {
    signature: '0x026597de8595f14ad2c0858a4fa79ddac50c187393fd2a056ca8dc69e46025ae1d65775dfd9e8f014041c59dbb3464ad8c69ae99fd5c5599bf3c6695d066c6c01c',
    data: {
      tokenID: 5,
      price: ethers.utils.parseEther('0.05'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmZXuyjK88soPFrfMdXNSKHdkULi3ExSqF4mUvEgdr8aJY',
    },
  },
  {
    signature: '0xb06e9d8bc969482bc806c6282fb75022e1ceafade722f042d0ee20983439b6e52e5642334ab647b9579b2dfdcd30d1bff46eb685b70a818dac29a8f055d6c5161b',
    data: {
      tokenID: 6,
      price: ethers.utils.parseEther('0.06'),
      uri: 'https://ipfs.moralis.io:2053/ipfs/QmPkA54hqMBt7aQjpd63i2cwUFgpeEGPiWYHHGMRX8sH5L',
    },
  },
];


class NFTThumbnail extends HTMLElement {
  constructor() {
    super();
  }

  async init(nft) {
    const img = document.createElement('img');
    img.src = '../scripts/screen' + nft.data.tokenID + '.jpg';
    this.appendChild(img);

    this.owned_ = document.createElement('img');
    this.owned_.className = 'owned';
    this.owned_.style.visibility = 'hidden';
    this.appendChild(this.owned_);
  }

  setOwned(owned) {
    if (owned) {
      this.owned_.style.visibility = 'visible';
    }
  }
};

// Now that our class is defined, we can register it
customElements.define('nft-thumbnail', NFTThumbnail);


class MessageThingy extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.message_ = document.createElement('div');
    this.message_.className = 'message';
    this.appendChild(this.message_);

    this.subMessage_ = document.createElement('div');
    this.subMessage_.className = 'sub-message';
    this.appendChild(this.subMessage_);

    this.close_ = document.createElement('a');
    this.close_.className = 'close';
    this.close_.innerHTML = '&times;';
    this.close_.onclick = () => { this.show(false); };
    this.close_.style.visibility = 'none';
    this.appendChild(this.close_);
  }

  show(showMessage, showClose) {
    if (showMessage) {
      this.style.opacity = '75%';
      this.style.visibility = 'visible';
    } else {
      this.style.opacity = '0%';
      this.style.visibility = 'hidden';
    }

    if (showClose) {
      this.close_.style.visibility = 'visible';
    } else {
      this.close_.style.visibility = 'hidden';
    }
  }

  setMessage(msg, subMsg) {
    this.message_.innerText = msg;
    this.subMessage_.innerText = subMsg;
  }
};

// Now that our class is defined, we can register it
customElements.define('message-thingy', MessageThingy);



const NFT_CONTRACT = '0xc0e4F91186625d2067918FC6aa5175f3560351A2';

class LazyMintApp {
  constructor() {
    this.contract_ = null;
  }

  async init() {
    await this.createThumbnails_();

    this.messages_ = document.getElementById('messages');
    this.messages_.show(false);
  }

  async initWeb3_() {
    await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider_ = new ethers.providers.Web3Provider(window.ethereum);
    this.signer_ = this.provider_.getSigner();

    const response = await fetch('../artifacts/contracts/example.sol/SimonDevNFT.json');
    const data = await response.json();
    this.contract_ = new ethers.Contract(NFT_CONTRACT, data.abi, this.signer_);
  }

  async createThumbnails_() {
    if (!this.contract_) {
      await this.initWeb3_();
    }

    this.thumbnails_ = [];
    for (let i = 0; i < NFTS.length; ++i) {
      this.thumbnails_[i] = document.createElement('nft-thumbnail');
      document.getElementById('nfts').appendChild(this.thumbnails_[i]);

      this.thumbnails_[i].init(NFTS[i]);
      this.thumbnails_[i].onclick = () => {
        this.onClick_(i);
      };
      try {
        await this.contract_.ownerOf(NFTS[i].data.tokenID);
        this.thumbnails_[i].setOwned(true);
      } catch(error) {
        // Ignore
      }
    }
  }

  async onClick_(index) {
    const nft = NFTS[index];

    this.messages_.setMessage('BUYING NFT', '')
    this.messages_.show(true, false);

    try {
      const transaction = await this.contract_.lazyMintNFT(
          nft.data, nft.signature, {gasLimit: 200000, value: nft.data.price});

      this.messages_.setMessage('Finalizing transaction...', 'Please wait.')

      await transaction.wait();

      this.messages_.setMessage('Congrats!', 'You just bought a url to a picture.');
      this.messages_.show(true, true);

      this.thumbnails_[index].setOwned(true);
    } catch(error) {
      if (error.reason) {
        this.messages_.setMessage('Error purchasing.', "But ethers.js doesn't actually tell us what went wrong :(");
      } else {
        this.messages_.setMessage('Error purchasing.', error.message);
      }
      this.messages_.show(true, true);
    }
  }
};


let APP = null;

window.addEventListener('DOMContentLoaded', async () => {
  APP = new LazyMintApp();
  await APP.init();
});
