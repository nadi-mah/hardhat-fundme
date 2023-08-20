const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {developmentChains} =  require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async function(){
    let fundMe
    let deployer
    let mockV3Aggregator
    
    beforeEach(async ()=>{
        deployer=(await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)

    })
    describe("constructor", async function(){
        it("Sets the Aggregator address correctly", async() =>{
            const response = await fundMe.getPriceFeed()
            assert.equal(response, await mockV3Aggregator.getAddress())
        })
    })
    describe("fund", async function(){
        it("Fails if you don't send enough ETH", async function (){
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("Updates the amount funded data structure", async function (){
            await fundMe.fund({ value: "1000000000000000000" })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), "1000000000000000000")
        })
        it("Add funder to the array of funders", async function(){
            await fundMe.fund({ value: "1000000000000000000" })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })
    describe("withdraw", async function(){
        beforeEach(async function(){
            await fundMe.fund({ value: "1000000000000000000" })

        })
        it("Withdraw ETH from a single founder", async function(){
            //Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const startingDeployerBalance = await ethers.provider.getBalance(deployer)
            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const {gasUsed, gasPrice} =  transactionReceipt
            const gasCost= gasUsed*gasPrice
            const endingFundeMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)
            //Assert
            assert.equal(endingFundeMeBalance, 0)
            assert.equal(startingFundMeBalance+startingDeployerBalance, endingDeployerBalance+ gasCost)
    
        })
        it("Allows us to withdraw with multipe funders", async function(){
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 0; i<6;i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: "1000000000000000000" })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const startingDeployerBalance = await ethers.provider.getBalance(deployer)
            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, gasPrice} =  transactionReceipt
            const gasCost= gasUsed*gasPrice
            //Assert
            const endingFundeMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)
            assert.equal(endingFundeMeBalance, 0)
            assert.equal(startingFundMeBalance+startingDeployerBalance, endingDeployerBalance+ gasCost)
            //Make sure that the funders reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i=0;i<7;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }

        })
        it("Only allows owner to withdraw", async function(){
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")

        })
        it("Cheaper withdraw testing...", async function(){
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 0; i<6;i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: "1000000000000000000" })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const startingDeployerBalance = await ethers.provider.getBalance(deployer)
            //Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, gasPrice} =  transactionReceipt
            const gasCost= gasUsed*gasPrice
            //Assert
            const endingFundeMeBalance = await ethers.provider.getBalance(fundMe.getAddress())
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)
            assert.equal(endingFundeMeBalance, 0)
            assert.equal(startingFundMeBalance+startingDeployerBalance, endingDeployerBalance+ gasCost)
            //Make sure that the funders reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i=0;i<7;i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }

        })
    })
})
