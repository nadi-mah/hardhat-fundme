// require("hardhat/config");
// const { network } = require("hardhat");
// require("dotenv").config()
// require("@nomicfoundation/hardhat-toolbox");
// require("hardhat-deploy");


require("@nomiclabs/hardhat-waffle")
//require("@nomiclabs/ethereum-waffle")
require("hardhat-gas-reporter")
//require("@nomiclabs/hardhat-etherscan")
//require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
//require("@nomicfoundation/hardhat-chai-matchers")
require("@nomicfoundation/hardhat-ethers")
require('hardhat-deploy');
/** @type import('hardhat/config').HardhatUserConfig */


const SEPOLIA_RPC_URL= process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY =process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",

    solidity: {
        compilers: [{version: "0.8.7",},{version: "0.6.6",},],
    },
    namedAccounts:{
        deployer:{
            default:0,
            1:0,
        },
        user:{
            default:1,
        }
    },

    networks: {
        sepolia:{
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockconfirmations: 6,

            
        }
    },

    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
    },

};
