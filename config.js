module.exports = {
    // Game mechanics
    MINING_INTERVAL: 5000, // 5 seconds
    BATTLE_INTERVAL: 6000, // 6 seconds
    MIN_COINS_PER_MINING: 1,
    MAX_COINS_PER_MINING: 10,
    MIN_EXP_PER_BATTLE: 5,
    MAX_EXP_PER_BATTLE: 20,
    EXP_PER_LEVEL: 100,
    
    // Payment rewards
    PREMIUM_COINS_REWARD: 100,
    PREMIUM_EXP_REWARD: 50,
    
    // Bot commands list
    BOT_COMMANDS: [
        { command: 'intro', description: '了解StarMiner游戏介绍' },
        { command: 'mine', description: '开始挖矿获得金币' },
        { command: 'battle', description: '开始战斗获得经验' },
        { command: 'bag', description: '查看我的金币' },
        { command: 'profile', description: '查看等级和经验' },
        { command: 'pay', description: '支付1Star获得奖励' },
        { command: 'market', description: '交易市场' },
        { command: 'stop', description: '停止当前活动' }
    ],
    
    // Messages
    WELCOME_MESSAGE: '🌟 欢迎来到 StarMiner！\n\n' +
        '这是一个挖矿和战斗的冒险游戏！\n\n' +
        '⛏️ 挖矿可以获得金币\n' +
        '⚔️ 战斗可以获得经验值\n' +
        '📈 经验值可以提升等级\n' +
        '💰 金币可以购买装备\n\n' +
        '注意：挖矿和战斗不能同时进行哦！\n\n' +
        '快开始你的冒险之旅吧！🚀',
    
    // Error messages
    ERROR_MESSAGES: {
        MINING_ERROR: '开始挖矿时发生错误，请稍后再试。',
        BATTLE_ERROR: '开始战斗时发生错误，请稍后再试。',
        BAG_ERROR: '查看背包时发生错误，请稍后再试。',
        PROFILE_ERROR: '查看档案时发生错误，请稍后再试。',
        PAYMENT_ERROR: '支付成功，但处理奖励时发生错误。请联系客服。',
        BALANCE_ERROR: '❌ 获取余额失败，请稍后再试\n可能原因：API访问限制或网络问题',
        GENERAL_ERROR: '抱歉，发生了错误 😔'
    }
};