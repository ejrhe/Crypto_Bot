const { ethers } = require('ethers')
require('dotenv').config();
const {
   RECEIVER_ADDRESS,
    GAS_LIMIT,
    PRIVATE_KEY,
    ETH_RPC_URL
} = process.env;

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL)

const increaseGasBy = 15000000000

async function getCurrentGasPrice() {
    try {
        const currentGasPrice = await provider.getFeeData();
        return (Number(currentGasPrice) + increaseGasBy) + ''
    }
    catch (err) {
        console.error(err);
    }
}

const bot = async () => {
    provider.on("block", async () => {
        console.log("Waiting For Incoming Tx")
        const _target = new ethers.Wallet(PRIVATE_KEY)
        const target = _target.connect(provider)
        const balance = await provider.getBalance(target.address)
        const currentGasPrice = await getCurrentGasPrice();
        const balanceinEther = ethers.formatEther(balance)
        if (Number(balanceinEther) > 0 && Number(currentGasPrice) > 0) {
            let withdrawAmount = Number(balance) - (Number(GAS_LIMIT) * Number(currentGasPrice));
            if (Number(withdrawAmount) > 0) {
                console.log(`Crypto Received ${balanceinEther}`)
                try {
                    await target.sendTransaction({
                        to: ADDRESS_RECEIVER,
                        value: withdrawAmount.toString(),
                        gasPrice: currentGasPrice.toString(),
                        gasLimit: GAS_LIMIT.toString()
                    })
                    console.log(`Success! Crypto Transfered -> ${ethers.utils.formatEther(balance)}`)
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
    )
}

bot()
