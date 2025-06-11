const { getUser, updateUser, calculateLevel } = require('./database');
const { WELCOME_MESSAGE, ERROR_MESSAGES } = require('./config');
const { 
    generateWalletConnectUrl, 
    isWalletConnected, 
    getWalletAddress, 
    disconnectWallet,
    createTransferTransaction,
    setupWalletListeners
} = require('./wallet');

async function handleIntro(ctx) {
    ctx.reply(WELCOME_MESSAGE);
}

async function handleStart(ctx) {
    ctx.reply(WELCOME_MESSAGE);
}

async function handleBag(ctx) {
    const userId = ctx.from.id;
    
    try {
        const user = await getUser(userId);
        ctx.reply(`🎒 我的背包\n\n💰 金币: ${user.coins}\n\n你可以用金币购买装备和道具！`);
    } catch (error) {
        console.error('Error getting bag:', error);
        ctx.reply(ERROR_MESSAGES.BAG_ERROR);
    }
}

async function handleProfile(ctx) {
    const userId = ctx.from.id;
    
    try {
        const user = await getUser(userId);
        const nextLevelExp = user.level * 100;
        const currentLevelExp = user.experience - ((user.level - 1) * 100);
        
        ctx.reply(`👤 我的档案\n\n` +
            `📊 等级: ${user.level}\n` +
            `✨ 经验值: ${user.experience}\n` +
            `📈 当前等级进度: ${currentLevelExp}/100\n` +
            `🎯 距离下一级还需: ${nextLevelExp - user.experience} 经验值\n\n` +
            `💰 金币: ${user.coins}`);
    } catch (error) {
        console.error('Error getting profile:', error);
        ctx.reply(ERROR_MESSAGES.PROFILE_ERROR);
    }
}

async function handleMarket(ctx) {
    ctx.reply('正在建设中，敬请期待...');
}

async function handleWallet(ctx) {
    const userId = ctx.from.id;
    
    try {
        if (isWalletConnected(userId)) {
            const address = getWalletAddress(userId);
            ctx.reply(`💼 钱包已连接\n\n📍 地址: ${address}\n\n你可以使用 /transfer 命令进行转账`);
        } else {
            setupWalletListeners(userId);
            const connectUrl = await generateWalletConnectUrl(userId);
            
            ctx.reply(`💼 连接TON钱包\n\n请点击下方链接连接你的TON钱包：\n${connectUrl}\n\n⚠️ 注意：请确保使用官方TON钱包应用`, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔗 连接钱包', url: connectUrl }
                    ]]
                }
            });
        }
    } catch (error) {
        console.error('钱包连接处理失败:', error);
        ctx.reply(ERROR_MESSAGES.WALLET_ERROR);
    }
}

async function handleTransfer(ctx) {
    const userId = ctx.from.id;
    const text = ctx.message.text;
    
    try {
        if (!isWalletConnected(userId)) {
            ctx.reply('❌ 请先连接钱包\n\n使用 /wallet 命令连接你的TON钱包');
            return;
        }

        // 解析转账命令格式: /transfer 金额
        const args = text.split(' ');
        if (args.length !== 2) {
            ctx.reply('❌ 使用格式错误\n\n正确格式: /transfer 金额\n例如: /transfer 0.1');
            return;
        }

        const amount = parseFloat(args[1]);
        if (isNaN(amount) || amount <= 0) {
            ctx.reply('❌ 请输入有效的转账金额\n\n金额必须是大于0的数字');
            return;
        }

        // 获取接收地址（从环境变量）
        const receiverAddress = process.env.RECEIVER_TON_ADDRESS;
        if (!receiverAddress) {
            ctx.reply('❌ 系统配置错误，请联系管理员');
            return;
        }

        // 创建转账交易
        await createTransferTransaction(userId, amount, receiverAddress);
        
        ctx.reply(`✅ 转账请求已发送\n\n💰 金额: ${amount} TON\n📍 目标地址: ${receiverAddress}\n\n请在钱包中确认交易`);
        
    } catch (error) {
        console.error('转账处理失败:', error);
        if (error.message.includes('钱包未连接')) {
            ctx.reply('❌ 钱包连接已断开，请重新连接');
        } else if (error.message.includes('无效的TON地址')) {
            ctx.reply('❌ 接收地址无效，请联系管理员');
        } else {
            ctx.reply(ERROR_MESSAGES.TRANSFER_ERROR);
        }
    }
}

function handleText(ctx) {
    if (!ctx.message.text.startsWith('/')) {
        ctx.reply(`你说: "${ctx.message.text}"\n\n使用命令菜单开始游戏吧！🎮`);
    }
}

function handleSticker(ctx) {
    ctx.reply('很棒的贴纸! 😄 快来玩StarMiner游戏吧！');
}

function handlePhoto(ctx) {
    ctx.reply('收到了一张图片! 📸 要不要试试挖矿赚金币？');
}

module.exports = {
    handleIntro,
    handleStart,
    handleBag,
    handleProfile,
    handleMarket,
    handleWallet,
    handleTransfer,
    handleText,
    handleSticker,
    handlePhoto
};