//Testnet deploy on Kovan
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { getAbi, getAddress } = require("@uma/core");
const { parseFixed } = require("@ethersproject/bignumber");

// Web3 Contract Params
const lspCreatorAddress = "0x81b0A8206C559a0747D86B4489D0055db4720E84"; // Kovan address
const ancillaryData = "";
const proposerReward = 0;
const kovanUrl = "https://kovan.infura.io/v3/81a0954561a94859a0c84f8be1d3afa6";
const mumbaiUrl = "";
const mnemonic = "<private mnemonic>";
const collateralToken = "0xA77a597C1b0ddA403aF54656c28bF7Bc0565351c";
const financialProductLibrary = "0x2CcA11DbbDC3E028D6c293eA5d386eE887071C59";
const gaspPrice = 50;
// Athlete Params



async function deployAthlete( _synthName, _synthSymbol, _expirationTimestamp, _priceIdentifier) {
  const url = kovanUrl;

  // See HDWalletProvider documentation: https://www.npmjs.com/package/@truffle/hdwallet-provider.
  const hdwalletOptions = {
    mnemonic: {
      phrase: mnemonic,
    },
    providerOrUrl: url,
    addressIndex: 0, // Change this to use the nth account.
  };

  // Initialize web3 with an HDWalletProvider if a mnemonic was provided. Otherwise, just give it the url.
  const web3 = new Web3(mnemonic ? new HDWalletProvider(hdwalletOptions) : url);
  const { toWei, utf8ToHex, padRight } = web3.utils;

  const accounts = await web3.eth.getAccounts();
  if (!accounts || accounts.length === 0)
    throw "No accounts. Must provide mnemonic or node must have unlocked accounts.";
  const account = accounts[0];
  const networkId = await web3.eth.net.getId();

  // Grab collateral decimals.
  const collateral = new web3.eth.Contract(
    getAbi("IERC20Standard"),
    collateralToken
  );
  const decimals = (await collateral.methods.decimals().call()).toString();


  // LSP parameters. Pass in arguments to customize these.
  const lspParams = {
    expirationTimestamp: _expirationTimestamp, // Timestamp that the contract will expire at.
    collateralPerPair: 1000000000000000000,
    priceIdentifier: padRight(utf8ToHex(_priceIdentifier), 64), // Price identifier to use.
    syntheticName: _synthName, // Long name.
    syntheticSymbol: _synthSymbol, // Short name.
    collateralToken: collateralToken, // Collateral token address.
    financialProductLibrary: financialProductLibrary,
    customAncillaryData: utf8ToHex(ancillaryData), // Default to empty bytes array if no ancillary data is passed.
    prepaidProposerReward: proposerReward // Default to 0 if no prepaid proposer reward is passed.
  };

  console.log("params:", lspParams);

  const lspCreator = new web3.eth.Contract(
    getAbi("LongShortPairCreator"),
    lspCreatorAddress
  );

  console.log("network id:", networkId);

  // Transaction parameters
  const transactionOptions = {
    gas: 12000000, // 12MM is very high. Set this lower if you only have < 2 ETH or so in your wallet.
    gasPrice: gasPrice * 1000000000, // gasprice arg * 1 GWEI
    from: account,
  };

  // Simulate transaction to test before sending to the network.
  console.log("Simulating Deployment...");
  const address = await lspCreator.methods.createLongShortPair(...Object.values(lspParams)).call(transactionOptions);
  console.log("Simulation successful. Expected Address:", address);

  // Since the simulated transaction succeeded, send the real one to the network.
  const { transactionHash } = await lspCreator.methods.createLongShortPair(...Object.values(lspParams)).send(transactionOptions);
  console.log("Deployed in transaction:", transactionHash);
  process.exit(0);
}


// TODO: Log each file to a save