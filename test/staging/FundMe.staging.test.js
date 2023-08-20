const {getNamedAccounts, ethers, network} = require("hardhat")
const {developmentChains} =  require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async function(){
    let fundMe
    let deployer
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)


    })
    it("Allows people to fund or withdraw", async function(){
        await fundMe.fund({ value: "1000000000000000000" })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.getAddress())
        assert.equal(endingBalance.toString(), "0")
    })
})