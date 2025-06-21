const ethers = require('ethers');
require('dotenv').config();

const {
    RECEIVER_ADDRESS,
    GAS_LIMIT,
    PRIVATE_KEY,
    EVM_RPC_URL
} = process.env;

const provider = new ethers.providers.JsonRpcProvider(EVM_RPC_URL);

const increaseGasBy = 15000000000;

async function getCurrentGasPrice() {
    try {
        const currentGasPrice = await provider.getGasPrice();
        return currentGasPrice.add(ethers.BigNumber.from(increaseGasBy));
    } catch (err) {
        console.error('Failed To Fetch Gas Price:', err);
        return null;
    }
}

const bot = async () => {
    provider.on("block", async () => {
        console.log("⏳ Waiting For Target Crypto...");

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        const gasPrice = await getCurrentGasPrice();

        if (!gasPrice) return;

        const balanceInEther = ethers.utils.formatEther(balance);
        console.log(`📡 Wallet Balance: ${balanceInEther} ETH`);

        const gasLimit = ethers.BigNumber.from(GAS_LIMIT);
        const gasCost = gasLimit.mul(gasPrice);

        if (balance.gt(gasCost)) {
            const withdrawAmount = balance.sub(gasCost);

            console.log(`✅ Detected Balance! Preparing To Send: ${ethers.utils.formatEther(withdrawAmount)} ETH`);

            try {
                const tx = await wallet.sendTransaction({
                    to: RECEIVER_ADDRESS,
                    value: withdrawAmount,
                    gasPrice: gasPrice,
                    gasLimit: gasLimit
                });

                console.log(`🚀 Transaction Sent! Hash: ${tx.hash}`);
            } catch (error) {
                console.error('❌ Transaction Failed:', error);
            }
        } else {
            console.log('⚠️ Not Enough Balance To Cover Gas Fees. Skipping...');
        }
    });
};

bot();
