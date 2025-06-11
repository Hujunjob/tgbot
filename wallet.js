const { TonConnect } = require('@tonconnect/sdk');
const { Address, toNano } = require('ton');
const { ERROR_MESSAGES } = require('./config');

// 存储用户钱包连接状态
const userWallets = new Map();

// 钱包连接配置
const tonConnectOptions = {
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json'
};

// 创建TonConnect实例
function createTonConnect(userId) {
    if (!userWallets.has(userId)) {
        const connector = new TonConnect(tonConnectOptions);
        userWallets.set(userId, {
            connector,
            isConnected: false,
            address: null
        });
    }
    return userWallets.get(userId);
}

// 生成钱包连接链接
async function generateWalletConnectUrl(userId) {
    try {
        const wallet = createTonConnect(userId);
        const walletConnectionSource = {
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            bridgeUrl: 'https://bridge.tonapi.io/bridge'
        };
        
        const connectUrl = await wallet.connector.connect(walletConnectionSource);
        return connectUrl;
    } catch (error) {
        console.error('生成钱包连接链接失败:', error);
        throw new Error('生成连接链接失败');
    }
}

// 检查钱包连接状态
function isWalletConnected(userId) {
    const wallet = userWallets.get(userId);
    return wallet && wallet.isConnected;
}

// 获取钱包地址
function getWalletAddress(userId) {
    const wallet = userWallets.get(userId);
    return wallet ? wallet.address : null;
}

// 断开钱包连接
async function disconnectWallet(userId) {
    try {
        const wallet = userWallets.get(userId);
        if (wallet) {
            await wallet.connector.disconnect();
            wallet.isConnected = false;
            wallet.address = null;
        }
        return true;
    } catch (error) {
        console.error('断开钱包连接失败:', error);
        return false;
    }
}

// 创建转账交易
async function createTransferTransaction(userId, amount, destinationAddress) {
    try {
        const wallet = userWallets.get(userId);
        if (!wallet || !wallet.isConnected) {
            throw new Error('钱包未连接');
        }

        // 验证目标地址
        let destination;
        try {
            destination = Address.parse(destinationAddress);
        } catch (error) {
            throw new Error('无效的TON地址');
        }

        // 验证金额
        const amountNano = toNano(amount.toString());
        if (amountNano <= 0) {
            throw new Error('转账金额必须大于0');
        }

        // 创建转账交易
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300, // 5分钟有效期
            messages: [
                {
                    address: destination.toString(),
                    amount: amountNano.toString(),
                    payload: '' // 可以添加备注
                }
            ]
        };

        // 发送交易请求
        const result = await wallet.connector.sendTransaction(transaction);
        return result;
    } catch (error) {
        console.error('创建转账交易失败:', error);
        throw error;
    }
}

// 监听钱包连接状态变化
function setupWalletListeners(userId) {
    const wallet = userWallets.get(userId);
    if (!wallet) return;

    wallet.connector.onStatusChange((walletInfo) => {
        if (walletInfo) {
            wallet.isConnected = true;
            wallet.address = walletInfo.account.address;
            console.log(`用户 ${userId} 钱包已连接: ${wallet.address}`);
        } else {
            wallet.isConnected = false;
            wallet.address = null;
            console.log(`用户 ${userId} 钱包已断开连接`);
        }
    });
}

module.exports = {
    createTonConnect,
    generateWalletConnectUrl,
    isWalletConnected,
    getWalletAddress,
    disconnectWallet,
    createTransferTransaction,
    setupWalletListeners
};