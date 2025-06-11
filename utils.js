const { ERROR_MESSAGES } = require('./config');

function handleAsyncError(asyncFn, errorMessage = ERROR_MESSAGES.GENERAL_ERROR) {
    return async (ctx) => {
        try {
            await asyncFn(ctx);
        } catch (error) {
            console.error('Async error:', error);
            ctx.reply(errorMessage);
        }
    };
}

function validateUserId(userId) {
    return userId && typeof userId === 'number' && userId > 0;
}

function validateAmount(amount) {
    return !isNaN(amount) && amount > 0;
}

function formatUserStats(user) {
    const nextLevelExp = user.level * 100;
    const currentLevelExp = user.experience - ((user.level - 1) * 100);
    const expToNextLevel = nextLevelExp - user.experience;
    
    return {
        level: user.level,
        experience: user.experience,
        currentLevelExp,
        expToNextLevel,
        coins: user.coins
    };
}

function isAdmin(userId) {
    const ADMIN_USER_ID = parseInt(process.env.ADMIN_USER_ID);
    return ADMIN_USER_ID && userId === ADMIN_USER_ID;
}

function logError(context, error) {
    console.error(`[${context}] Error:`, error);
}

module.exports = {
    handleAsyncError,
    validateUserId,
    validateAmount,
    formatUserStats,
    isAdmin,
    logError
};