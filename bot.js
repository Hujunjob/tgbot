const { Telegraf } = require('telegraf');
const { initializeDatabase, closeDatabase } = require('./database');
const { startMining, startBattle, stopAction } = require('./gameLogic');
const {
    handleIntro,
    handleStart,
    handleBag,
    handleProfile,
    handleGift,
    handleMarket,
    handleText,
    handleSticker,
    handlePhoto
} = require('./commands');
const {
    handlePay,
    handlePreCheckout,
    handleSuccessfulPayment,
    handleBalance,
    handleWithdraw
} = require('./payment');
const { BOT_COMMANDS, ERROR_MESSAGES } = require('./config');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

initializeDatabase();



bot.command('intro', handleIntro);

bot.command('start', handleStart);
bot.command('mine', async (ctx) => {
    const userId = ctx.from.id;
    
    try {
        const result = startMining(userId, ctx);
        if (result) {
            ctx.reply(result);
        }
    } catch (error) {
        console.error('Error starting mining:', error);
        ctx.reply(ERROR_MESSAGES.MINING_ERROR);
    }
});

bot.command('battle', async (ctx) => {
    const userId = ctx.from.id;
    
    try {
        const result = startBattle(userId, ctx);
        if (result) {
            ctx.reply(result);
        }
    } catch (error) {
        console.error('Error starting battle:', error);
        ctx.reply(ERROR_MESSAGES.BATTLE_ERROR);
    }
});

bot.command('bag', handleBag);

bot.command('profile', handleProfile);

bot.command('stop', (ctx) => {
    const userId = ctx.from.id;
    const result = stopAction(userId);
    ctx.reply(result);
});

bot.command('gift', handleGift);
bot.command('market', handleMarket);


bot.command('pay', handlePay);

bot.on('pre_checkout_query', handlePreCheckout);

bot.on('successful_payment', handleSuccessfulPayment);

bot.command('balance', handleBalance);

bot.command('withdraw', handleWithdraw);

bot.on('text', handleText);

bot.on('sticker', handleSticker);

bot.on('photo', handlePhoto);

bot.catch((err, ctx) => {
    console.error('Bot错误:', err);
    ctx.reply(ERROR_MESSAGES.GENERAL_ERROR);
});

bot.telegram.setMyCommands(BOT_COMMANDS);


bot.launch().then(() => {
    console.log('StarMiner Bot 已启动! 🚀');
    console.log('数据库已连接');
    console.log('命令菜单已设置完成');
}).catch((err) => {
    console.error('启动失败:', err);
});


process.once('SIGINT', () => {
    closeDatabase();
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    closeDatabase();
    bot.stop('SIGTERM');
});