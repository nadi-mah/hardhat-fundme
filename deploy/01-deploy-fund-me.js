// function deployfunc(hre){
//     console.log("nadia")
//     hre.getNamedAccounts
//     hre.deployments
// }
// module.exports.default = deployfunc


// module.exports = async (hre) =>{
//     const {getNamedAccounts, deployments} =hre
//     // hre.getNamedAccounts
//     // hre.deployments
//}

const { network } = require("hardhat")
const{ networkConfig }= require("../helper-hardhat-config")
const {developmentChains } = require("../helper-hardhat-config")
const { verify }= require("../utils/verify")

module.exports = async ({getNamedAccounts, deployments})=>{
    const{ deploy,log }=deployments
    const{ deployer }= await getNamedAccounts()
    const chainId = network.config.chainId

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    //to use localhost ot hardhat network we should uese mock
    if(developmentChains.includes(network.name)){
        ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress =ethUsdAggregator.address
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put price feed address 
        log: true,
        waitconfirmations: network.config.blockconfirmation || 1,
    })
    //if we are using testnet it requires verify
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_APL_KEY){
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    

log("-------------------------------------------------------------")
    
}
module.exports.tags=["all", "fundme"]