const sqlite3 = require('sqlite3').verbose();
const { EXP_PER_LEVEL } = require('./config');

const db = new sqlite3.Database('starminer.db');

function initializeDatabase() {
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
    console.log('初始化数据库');
}

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
    return Math.floor(experience / EXP_PER_LEVEL) + 1;
}

function closeDatabase() {
    db.close();
}

module.exports = {
    initializeDatabase,
    getUser,
    updateUser,
    calculateLevel,
    closeDatabase
};