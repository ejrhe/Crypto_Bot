const ethers = require('ethers')
require('dotenv').config();
const {
    RECEIVER_ADDRESS,
    GAS_LIMIT,
    PRIVATE_KEY,
    EVM_RPC_URL
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(EVM_RPC_URL)

const increaseGasBy = 15000000000

async function getCurrentGasPrice() {
    try {
        const currentGasPrice = await provider.getGasPrice();
        return (Number(currentGasPrice) + increaseGasBy) + ''
    }
    catch (err) {
        console.error(err);
    }
}

const bot = async () => {
    provider.on("block", async () => {
        console.log("Waiting For Target Crypto")
        const _target = new ethers.Wallet(PRIVATE_KEY)
        const target = _target.connect(provider)
        const balance = await provider.getBalance(target.address)
        const currentGasPrice = await getCurrentGasPrice();
        const balanceinEther = ethers.utils.formatEther(balance)
        if (Number(balanceinEther) > 0 && Number(currentGasPrice) > 0) {
            let withdrawAmount = Number(balance) - (Number(GAS_LIMIT) * Number(currentGasPrice));
            if (Number(withdrawAmount) > 0) {
                console.log(`Received Target Crypto -> ${balanceinEther}`)
                try {
                    await target.sendTransaction({
                        to: RECEIVER_ADDRESS,
                        value: withdrawAmount.toString(),
                        gasPrice: currentGasPrice.toString(),
                        gasLimit: GAS_LIMIT.toString()
                    })
                    console.log(`Transfered Target Crypto -> ${ethers.utils.formatEther(balance)}`)
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
    )
}

bot()
