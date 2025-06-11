const { getUser, updateUser } = require('./database');
const {
    MINING_INTERVAL,
    BATTLE_INTERVAL,
    MIN_COINS_PER_MINING,
    MAX_COINS_PER_MINING,
    MIN_EXP_PER_BATTLE,
    MAX_EXP_PER_BATTLE
} = require('./config');

const userActions = new Map();

function startMining(userId, ctx) {
    if (userActions.has(userId)) {
        const currentAction = userActions.get(userId);
        userActions.delete(userId);
        return `✋ 已停止${currentAction}活动！`;
    }
    
    userActions.set(userId, '挖矿');
    ctx.reply('⛏️ 开始挖矿...\n正在挖掘星矿中... ✨');
    
    const miningInterval = setInterval(async () => {
        if (!userActions.has(userId) || userActions.get(userId) !== '挖矿') {
            clearInterval(miningInterval);
            return;
        }
        
        try {
            const currentUser = await getUser(userId);
            const coinsEarned = Math.floor(Math.random() * (MAX_COINS_PER_MINING - MIN_COINS_PER_MINING + 1)) + MIN_COINS_PER_MINING;
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
    }, MINING_INTERVAL);
    
    return null;
}

function startBattle(userId, ctx) {
    if (userActions.has(userId)) {
        const currentAction = userActions.get(userId);
        userActions.delete(userId);
        return `✋ 已停止${currentAction}活动！`;
    }
    
    userActions.set(userId, '战斗');
    ctx.reply('⚔️ 开始战斗...\n正在与星际怪物战斗中... 👾');
    
    const battleInterval = setInterval(async () => {
        if (!userActions.has(userId) || userActions.get(userId) !== '战斗') {
            clearInterval(battleInterval);
            return;
        }
        
        try {
            const currentUser = await getUser(userId);
            const expEarned = Math.floor(Math.random() * (MAX_EXP_PER_BATTLE - MIN_EXP_PER_BATTLE + 1)) + MIN_EXP_PER_BATTLE;
            const newExperience = currentUser.experience + expEarned;
            const { calculateLevel } = require('./database');
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
    }, BATTLE_INTERVAL);
    
    return null;
}

function stopAction(userId) {
    if (userActions.has(userId)) {
        const action = userActions.get(userId);
        userActions.delete(userId);
        return `✋ 已停止${action}活动！`;
    }
    return '你当前没有进行任何活动。';
}

function getUserAction(userId) {
    return userActions.get(userId);
}

function hasUserAction(userId) {
    return userActions.has(userId);
}

module.exports = {
    startMining,
    startBattle,
    stopAction,
    getUserAction,
    hasUserAction
};