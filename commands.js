const { getUser, updateUser, getPlayerGifts, calculateLevel } = require('./database');
const { WELCOME_MESSAGE, ERROR_MESSAGES } = require('./config');

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

async function handleGift(ctx) {
    const userId = ctx.from.id;
    
    try {
        const gifts = await getPlayerGifts(userId);
        
        if (gifts.length === 0) {
            ctx.reply('🎁 我的礼品\n\n暂时没有礼品，继续游戏来获得礼品吧！\n\n💡 提示：完成任务、升级或充值可以获得礼品奖励');
            return;
        }
        
        const giftCounts = {};
        gifts.forEach(gift => {
            const key = `${gift.gift_name} (${gift.gift_type})`;
            giftCounts[key] = (giftCounts[key] || 0) + gift.quantity;
        });
        
        let message = '🎁 我的礼品\n\n';
        Object.entries(giftCounts).forEach(([giftInfo, totalQuantity]) => {
            message += `🎁 ${giftInfo}: ${totalQuantity}\n`;
        });
        
        message += `\n📦 总礼品数量: ${Object.keys(giftCounts).length} 种`;
        
        ctx.reply(message);
    } catch (error) {
        console.error('Error getting gifts:', error);
        ctx.reply(ERROR_MESSAGES.GIFT_ERROR);
    }
}

async function handleMarket(ctx) {
    ctx.reply('正在建设中，敬请期待...');
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
    handleGift,
    handleMarket,
    handleText,
    handleSticker,
    handlePhoto
};