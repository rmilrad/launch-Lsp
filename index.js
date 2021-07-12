const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { getAbi, getAddress } = require("@uma/core");
const { parseFixed } = require("@ethersproject/bignumber");


(
    async () => {
        const url = argv.url || "http://localhost:8545";

        // See HDWalletProvider documentation: https://www.npmjs.com/package/@truffle/hdwallet-provider.
        const hdwalletOptions = {
          mnemonic: {
            phrase: argv.mnemonic,
          },
          providerOrUrl: url,
          addressIndex: 0, // Change this to use the nth account.
        };
      
        // Initialize web3 with an HDWalletProvider if a mnemonic was provided. Otherwise, just give it the url.
        const web3 = new Web3(argv.mnemonic ? new HDWalletProvider(hdwalletOptions) : url);
        const { toWei, utf8ToHex, padRight } = web3.utils;
      
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0)
          throw "No accounts. Must provide mnemonic or node must have unlocked accounts.";
        const account = accounts[0];
        const networkId = await web3.eth.net.getId();

        // cOLLATERAL
        const collateral = new web3.eth.COntract(
            getAbi("IERC20Standard"),
            argv.collateralAddress // replace with option to put in address
        )
        const decimals = (await collateral.methods.decimals().call()).toString();

        //// LSP Creation Code ////

        //LSP Construction Parameters
        const lspParams {
            expirationTimestamp: "stuff",
            collateralPerPair: "",
            priceIdentifier: "",
            financialProductLibraryAddress: ,
            longTokenAddress: ,
            shortTokenAddress: ,
            customAncillaryData: ,
            finderAddress: ,

        }
        const lsp = new web3.eth.Contract(
            getAbi(),
            getAddress()
        );
            
    })()