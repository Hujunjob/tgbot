const { getUser, updateUser } = require('./database');
const { PREMIUM_COINS_REWARD, PREMIUM_EXP_REWARD, ERROR_MESSAGES } = require('./config');

function handlePay(ctx) {
    const invoice = {
        title: 'StarMiner 高级功能',
        description: '解锁StarMiner游戏的高级功能和特权',
        payload: 'premium_access',
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: 'StarMiner高级版', amount: 1 }],
        start_parameter: 'premium_payment'
    };
    
    ctx.replyWithInvoice(invoice);
}

function handlePreCheckout(ctx) {
    ctx.answerPreCheckoutQuery(true);
}

async function handleSuccessfulPayment(ctx) {
    const userId = ctx.from.id;
    const paymentInfo = ctx.message.successful_payment;
    
    try {
        const user = await getUser(userId);
        await updateUser(userId, {
            coins: user.coins + PREMIUM_COINS_REWARD,
            experience: user.experience + PREMIUM_EXP_REWARD
        });
        
        ctx.reply(`🎉 支付成功！感谢您的支持！\n\n` +
                 `🎁 您获得了：\n` +
                 `💰 ${PREMIUM_COINS_REWARD} 金币\n` +
                 `✨ ${PREMIUM_EXP_REWARD} 经验值\n\n` +
                 `享受您的StarMiner高级体验！`);
    } catch (error) {
        console.error('Payment processing error:', error);
        ctx.reply(ERROR_MESSAGES.PAYMENT_ERROR);
    }
}

async function handleBalance(ctx) {
    const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID);
    
    if (!ADMIN_USER_ID || ctx.from.id !== ADMIN_USER_ID) {
        return;
    }
    
    try {
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
        ctx.reply(ERROR_MESSAGES.BALANCE_ERROR);
    }
}

async function handleWithdraw(ctx) {
    const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID);
    
    if (!ADMIN_USER_ID || ctx.from.id !== ADMIN_USER_ID) {
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
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/refundStarPayment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: ctx.from.id,
                telegram_payment_charge_id: Date.now().toString(),
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
}

module.exports = {
    handlePay,
    handlePreCheckout,
    handleSuccessfulPayment,
    handleBalance,
    handleWithdraw
};