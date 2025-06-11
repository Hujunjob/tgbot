# StarMiner Telegram Bot

一个使用 Node.js 和 Telegraf 库开发的 Telegram 机器人。

## 设置步骤

1. 安装依赖:
```bash
npm install
```

2. 创建 `.env` 文件:
```bash
cp .env.example .env
```

3. 在 `.env` 文件中设置你的机器人token和管理员ID:
```
BOT_TOKEN=your_actual_bot_token_here
ADMIN_USER_ID=your_telegram_user_id_here
```

4. 运行机器人:
```bash
node bot.js
```

## 获取 Bot Token 和用户ID

### Bot Token:
1. 在 Telegram 中找到 [@BotFather](https://t.me/botfather)
2. 发送 `/newbot` 命令
3. 按照提示设置机器人名称和用户名
4. 复制获得的 token 到 `.env` 文件中

### 获取你的用户ID:
1. 在 Telegram 中找到 [@userinfobot](https://t.me/userinfobot)
2. 发送 `/start` 命令
3. 复制返回的用户ID到 `.env` 文件的 `ADMIN_USER_ID` 中

## 可用命令

### 游戏命令:
- `/intro` - 游戏介绍
- `/mine` - 开始挖矿获得金币
- `/battle` - 开始战斗获得经验
- `/bag` - 查看背包金币
- `/profile` - 查看等级和经验
- `/pay` - 支付1Star获得奖励
- `/stop` - 停止当前活动

### 管理员命令:
- `/balance` - 查看bot的Star余额（仅管理员）
- `/withdraw <数量>` - 提取Star余额（仅管理员）

## 功能特性

- 文本消息处理
- 贴纸和图片响应
- 错误处理
- 优雅退出处理