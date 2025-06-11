const { Telegraf } = require('telegraf');
const { initializeDatabase, closeDatabase } = require('./database');
const { startMining, startBattle, stopAction } = require('./gameLogic');
const {
    handleIntro,
    handleStart,
    handleBag,
    handleProfile,
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
const { logError } = require('./utils');
require('dotenv').config();

// 设置进程标题
process.title = 'starminer-bot';

// 优雅退出处理
const gracefulShutdown = (signal) => {
    console.log(`收到 ${signal} 信号，正在优雅关闭...`);
    closeDatabase();
    bot.stop(signal);
    process.exit(0);
};

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
    logError('Bot全局错误', err);
    if (ctx && ctx.reply) {
        ctx.reply(ERROR_MESSAGES.GENERAL_ERROR);
    }
});

bot.telegram.setMyCommands(BOT_COMMANDS);


bot.launch().then(() => {
    const startTime = new Date().toISOString();
    console.log(`[${startTime}] StarMiner Bot 已启动! 🚀`);
    console.log(`[${startTime}] 进程ID: ${process.pid}`);
    console.log(`[${startTime}] Node.js版本: ${process.version}`);
    console.log(`[${startTime}] 运行环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[${startTime}] 数据库已连接`);
    console.log(`[${startTime}] 命令菜单已设置完成`);
}).catch((err) => {
    logError('启动失败', err);
    process.exit(1);
});


// 处理进程信号
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
    logError('未捕获的异常', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    logError('未处理的Promise拒绝', { reason, promise });
});