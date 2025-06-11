require('dotenv').config();
const { Telegraf } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();

const bot = new Telegraf(process.env.BOT_TOKEN);

const db = new sqlite3.Database('starminer.db');
const userActions = new Map();
// const GapTime = 

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        coins INTEGER DEFAULT 0,
        experience INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

function getUser(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            if (!row) {
                db.run('INSERT INTO users (user_id) VALUES (?)', [userId], function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({
                        user_id: userId,
                        coins: 0,
                        experience: 0,
                        level: 1
                    });
                });
            } else {
                resolve(row);
            }
        });
    });
}

function updateUser(userId, data) {
    return new Promise((resolve, reject) => {
        const level = calculateLevel(data.experience || 0);
        db.run(`UPDATE users SET 
                coins = ?, 
                experience = ?, 
                level = ?,
                updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = ?`, 
                [data.coins, data.experience, level, userId], 
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
    });
}

function calculateLevel(experience) {
    return Math.floor(experience / 100) + 1;
}

bot.command('intro', (ctx) => {
    ctx.reply('🌟 欢迎来到 StarMiner！\n\n' +
        '这是一个挖矿和战斗的冒险游戏！\n\n' +
        '⛏️ 挖矿可以获得金币\n' +
        '⚔️ 战斗可以获得经验值\n' +
        '📈 经验值可以提升等级\n' +
        '💰 金币可以购买装备\n\n' +
        '注意：挖矿和战斗不能同时进行哦！\n\n' +
        '快开始你的冒险之旅吧！🚀');
});

bot.command('start', (ctx) => {
    ctx.reply('🌟 欢迎来到 StarMiner！\n\n' +
        '这是一个挖矿和战斗的冒险游戏！\n\n' +
        '⛏️ 挖矿可以获得金币\n' +
        '⚔️ 战斗可以获得经验值\n' +
        '📈 经验值可以提升等级\n' +
        '💰 金币可以购买装备\n\n' +
        '注意：挖矿和战斗不能同时进行哦！\n\n' +
        '快开始你的冒险之旅吧！🚀');
});
bot.command('mine', async (ctx) => {
    const userId = ctx.from.id;
    
    if (userActions.has(userId)) {
        const currentAction = userActions.get(userId);
        userActions.delete(userId);
        ctx.reply(`✋ 已停止${currentAction}活动！`);
    }
    
    try {
        const user = await getUser(userId);
        userActions.set(userId, '挖矿');
        ctx.reply('⛏️ 开始挖矿...\n正在挖掘星矿中... ✨');
        
        const miningInterval = setInterval(async () => {
            if (!userActions.has(userId) || userActions.get(userId) !== '挖矿') {
                clearInterval(miningInterval);
                return;
            }
            
            try {
                const currentUser = await getUser(userId);
                const coinsEarned = Math.floor(Math.random() * 10) + 1;
                const newCoins = currentUser.coins + coinsEarned;
                
                await updateUser(userId, {
                    coins: newCoins,
                    experience: currentUser.experience
                });
                
                ctx.reply(`⛏️ 挖矿中... 获得了 ${coinsEarned} 金币！💰\n当前金币: ${newCoins}`);
            } catch (error) {
                console.error('Mining error:', error);
                userActions.delete(userId);
                clearInterval(miningInterval);
            }
        }, 5000);
    } catch (error) {
        console.error('Error starting mining:', error);
        ctx.reply('开始挖矿时发生错误，请稍后再试。');
    }
});

bot.command('battle', async (ctx) => {
    const userId = ctx.from.id;
    
    if (userActions.has(userId)) {
        const currentAction = userActions.get(userId);
        userActions.delete(userId);
        ctx.reply(`✋ 已停止${currentAction}活动！`);
    }
    
    try {
        const user = await getUser(userId);
        userActions.set(userId, '战斗');
        ctx.reply('⚔️ 开始战斗...\n正在与星际怪物战斗中... 👾');
        
        const battleInterval = setInterval(async () => {
            if (!userActions.has(userId) || userActions.get(userId) !== '战斗') {
                clearInterval(battleInterval);
                return;
            }
            
            try {
                const currentUser = await getUser(userId);
                const expEarned = Math.floor(Math.random() * 20) + 5;
                const newExperience = currentUser.experience + expEarned;
                const newLevel = calculateLevel(newExperience);
                
                await updateUser(userId, {
                    coins: currentUser.coins,
                    experience: newExperience
                });
                
                ctx.reply(`⚔️ 战斗中... 获得了 ${expEarned} 经验值！✨\n当前经验: ${newExperience} | 等级: ${newLevel}`);
            } catch (error) {
                console.error('Battle error:', error);
                userActions.delete(userId);
                clearInterval(battleInterval);
            }
        }, 6000);
    } catch (error) {
        console.error('Error starting battle:', error);
        ctx.reply('开始战斗时发生错误，请稍后再试。');
    }
});

bot.command('bag', async (ctx) => {
    const userId = ctx.from.id;
    
    try {
        const user = await getUser(userId);
        ctx.reply(`🎒 我的背包\n\n💰 金币: ${user.coins}\n\n你可以用金币购买装备和道具！`);
    } catch (error) {
        console.error('Error getting bag:', error);
        ctx.reply('查看背包时发生错误，请稍后再试。');
    }
});

bot.command('profile', async (ctx) => {
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
        ctx.reply('查看档案时发生错误，请稍后再试。');
    }
});

bot.command('stop', (ctx) => {
    const userId = ctx.from.id;
    
    if (userActions.has(userId)) {
        const action = userActions.get(userId);
        userActions.delete(userId);
        ctx.reply(`✋ 已停止${action}活动！`);
    } else {
        ctx.reply('你当前没有进行任何活动。');
    }
});
bot.command('market', (ctx) => {
    ctx.reply('正在建设中，敬请期待...');
});

bot.command('miniapp', async (ctx) => {
    const userId = ctx.from.id;
    
    try {
        const user = await getUser(userId);
        const currentAction = userActions.get(userId) || '无';
        
        const webAppUrl = `https://your-domain.com/miniapp?user_id=${userId}`;
        
        ctx.reply('🎮 打开StarMiner小程序查看详细状态！', {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🚀 打开小程序',
                        web_app: { url: webAppUrl }
                    }
                ]]
            }
        });
    } catch (error) {
        console.error('Error opening miniapp:', error);
        ctx.reply('❌ 打开小程序失败，请稍后再试');
    }
});

bot.command('pay', (ctx) => {
    const invoice = {
        title: 'StarMiner 高级功能',
        description: '解锁StarMiner游戏的高级功能和特权',
        payload: 'premium_access',
        provider_token: '', // Telegram Stars不需要provider_token
        currency: 'XTR', // Telegram Stars货币代码
        prices: [{ label: 'StarMiner高级版', amount: 1 }], // 1 Star
        start_parameter: 'premium_payment'
    };
    
    ctx.replyWithInvoice(invoice);
});

bot.on('pre_checkout_query', (ctx) => {
    ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', async (ctx) => {
    const userId = ctx.from.id;
    const paymentInfo = ctx.message.successful_payment;
    
    try {
        const user = await getUser(userId);
        await updateUser(userId, {
            coins: user.coins + 100,
            experience: user.experience + 50
        });
        
        ctx.reply('🎉 支付成功！感谢您的支持！\n\n' +
                 '🎁 您获得了：\n' +
                 '💰 100 金币\n' +
                 '✨ 50 经验值\n\n' +
                 '享受您的StarMiner高级体验！');
    } catch (error) {
        console.error('Payment processing error:', error);
        ctx.reply('支付成功，但处理奖励时发生错误。请联系客服。');
    }
});

// 管理员命令 - 检查bot的Star余额
bot.command('balance', async (ctx) => {
    const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID);
    
    if (!ADMIN_USER_ID || ctx.from.id !== ADMIN_USER_ID) {
        // ctx.reply('❌ 你没有权限执行此命令');
        return;
    }
    
    try {
        // 使用正确的API方法获取Star交易记录
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getStarTransactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                offset: 0,
                limit: 100
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            const transactions = data.result.transactions;
            let totalReceived = 0;
            let totalWithdrawn = 0;
            
            transactions.forEach(transaction => {
                if (transaction.amount > 0) {
                    totalReceived += transaction.amount;
                } else {
                    totalWithdrawn += Math.abs(transaction.amount);
                }
            });
            
            const balance = totalReceived - totalWithdrawn;
            
            ctx.reply(`⭐ Bot Star 余额信息：\n\n` +
                     `💰 当前余额: ${balance} Stars\n` +
                     `📈 总收入: ${totalReceived} Stars\n` +
                     `📉 总提取: ${totalWithdrawn} Stars\n` +
                     `📊 交易记录: ${transactions.length} 笔\n\n` +
                     `使用 /withdraw <数量> 命令提取余额`);
        } else {
            throw new Error(data.description || 'API请求失败');
        }
    } catch (error) {
        console.error('获取余额失败:', error);
        ctx.reply('❌ 获取余额失败，请稍后再试\n' + 
                 '可能原因：API访问限制或网络问题');
    }
});

// 管理员命令 - 提取Star余额
bot.command('withdraw', async (ctx) => {
    const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID);
    
    if (!ADMIN_USER_ID || ctx.from.id !== ADMIN_USER_ID) {
        // ctx.reply('❌ 你没有权限执行此命令');
        return;
    }
    
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        ctx.reply('❌ 请指定提取数量\n用法: /withdraw <数量>\n例如: /withdraw 10');
        return;
    }
    
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
        ctx.reply('❌ 请输入有效的提取数量');
        return;
    }
    
    try {
        // 使用正确的API方法创建提取请求
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/refundStarPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: ctx.from.id,
                telegram_payment_charge_id: Date.now().toString(), // 使用时间戳作为唯一ID
                amount: amount
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            ctx.reply(`✅ 提取请求已提交！\n💫 提取数量: ${amount} Stars\n\n` +
                     `提取将在24小时内处理完成。`);
        } else {
            throw new Error(data.description || '提取失败');
        }
    } catch (error) {
        console.error('提取失败:', error);
        if (error.message.includes('BALANCE_TOO_LOW')) {
            ctx.reply('❌ 余额不足，无法提取指定数量');
        } else if (error.message.includes('AMOUNT_TOO_SMALL')) {
            ctx.reply('❌ 提取数量太小，最小提取数量可能有限制');
        } else if (error.message.includes('INVALID_CHARGE_ID')) {
            ctx.reply('❌ 无效的交易ID，请稍后再试');
        } else {
            ctx.reply('❌ 提取失败：' + error.message + '\n\n注意：提取功能需要有实际的Star收入记录');
        }
    }
});

bot.on('text', (ctx) => {
    if (!ctx.message.text.startsWith('/')) {
        ctx.reply(`你说: "${ctx.message.text}"\n\n使用命令菜单开始游戏吧！🎮`);
    }
});

bot.on('sticker', (ctx) => {
    ctx.reply('很棒的贴纸! 😄 快来玩StarMiner游戏吧！');
});

bot.on('photo', (ctx) => {
    ctx.reply('收到了一张图片! 📸 要不要试试挖矿赚金币？');
});

bot.catch((err, ctx) => {
    console.error('Bot错误:', err);
    ctx.reply('抱歉，发生了错误 😔');
});

bot.telegram.setMyCommands([
    { command: 'intro', description: '了解StarMiner游戏介绍' },
    { command: 'mine', description: '开始挖矿获得金币' },
    { command: 'battle', description: '开始战斗获得经验' },
    { command: 'bag', description: '查看我的金币' },
    { command: 'profile', description: '查看等级和经验' },
    { command: 'miniapp', description: '打开小程序查看状态' },
    { command: 'pay', description: '支付1Star获得奖励' },
    { command: 'market', description: '交易市场' },
    { command: 'stop', description: '停止当前活动' }
]);

bot.launch().then(() => {
    console.log('StarMiner Bot 已启动! 🚀');
    console.log('数据库已连接');
    console.log('命令菜单已设置完成');
}).catch((err) => {
    console.error('启动失败:', err);
});

process.once('SIGINT', () => {
    db.close();
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    db.close();
    bot.stop('SIGTERM');
});