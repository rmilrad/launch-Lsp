//Testnet deploy on Kovan
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { getAbi, getAddress } = require("@uma/core");
const { parseFixed } = require("@ethersproject/bignumber");

// Web3 Contract Params
const lspCreatorAddress = "0x57EE47829369e2EF62fBb423648bec70d0366204"; // Mumbai address
const ancillaryData = "";
const proposerReward = 0;
const networkUrl = "https://rpc-mumbai.maticvigil.com";
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
const collateralToken = "0x8C086885624C5b823Cc6fcA7BFF54C454D6b5239";
const financialProductLibrary = "0xC7B7029373f504949553106c9eb2dAfDd48eF086";
const _gasPrice = 50;
const _networkId = 80001;
// Athlete Params



async function deployAthlete( _synthName, _synthSymbol, _expirationTimestamp, ancillaryData) {
  const url = networkUrl;

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
  const networkId = _networkId;

  // Grab collateral decimals.
  const collateral = new web3.eth.Contract(
    getAbi("IERC20Standard"),
    collateralToken
  );
  const decimals = (await collateral.methods.decimals().call()).toString();


  // LSP parameters. Pass in arguments to customize these.
  const lspParams = {
    expirationTimestamp: _expirationTimestamp, // Timestamp that the contract will expire at.
    collateralPerPair: 10000000000000,
    priceIdentifier: padRight(utf8ToHex("SPD"), 64), // Price identifier to use.
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
    gasPrice: _gasPrice * 1000000000, // gasprice arg * 1 GWEI
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
deployAthlete("Derrick Henry", "aDH", "1628623703", "0001 0001").catch(err => {
  console.error(err);
});