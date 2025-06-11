# StarMiner Bot 部署指南

## 前置要求

### 系统要求
- Ubuntu 18.04+ / CentOS 7+ / macOS
- Node.js 16+ 
- npm 或 yarn
- PM2 (用于进程管理)

### 可选要求
- Nginx (用于反向代理，如果需要web界面)
- Logrotate (用于日志轮转)

## 快速部署

### 1. 安装依赖

```bash
# 安装 Node.js (如果还没安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装项目依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

必需的环境变量：
```env
BOT_TOKEN=your_telegram_bot_token
ADMIN_USER_ID=your_telegram_user_id
NODE_ENV=production
```

### 3. 启动 Bot

```bash
# 使用启动脚本（推荐）
./start.sh start

# 或直接使用 PM2
pm2 start ecosystem.config.js --env production
pm2 save  # 保存配置，开机自启
```

## 详细部署步骤

### 方式一：使用启动脚本（推荐）

```bash
# 查看所有可用命令
./start.sh

# 启动
./start.sh start

# 查看状态
./start.sh status

# 查看日志
./start.sh logs

# 重启
./start.sh restart

# 停止
./start.sh stop
```

### 方式二：使用 PM2

```bash
# 启动
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs starminer-bot

# 重启
pm2 restart starminer-bot

# 停止
pm2 stop starminer-bot

# 删除进程
pm2 delete starminer-bot
```

### 方式三：安装为系统服务

```bash
# 使用启动脚本安装
./start.sh install-service

# 启动服务
sudo systemctl start starminer-bot

# 设置开机自启
sudo systemctl enable starminer-bot

# 查看服务状态
sudo systemctl status starminer-bot

# 查看服务日志
sudo journalctl -u starminer-bot -f
```

## 监控和维护

### 查看运行状态

```bash
# PM2 状态
pm2 status

# PM2 监控面板
pm2 monit

# 系统资源使用
pm2 show starminer-bot
```

### 日志管理

```bash
# 查看实时日志
pm2 logs starminer-bot --lines 50

# 查看错误日志
pm2 logs starminer-bot --err

# 清空日志
pm2 flush starminer-bot
```

### 日志轮转设置

```bash
# 复制日志轮转配置
sudo cp logrotate.conf /etc/logrotate.d/starminer-bot

# 编辑配置文件，替换路径和用户名
sudo vim /etc/logrotate.d/starminer-bot

# 测试日志轮转
sudo logrotate -d /etc/logrotate.d/starminer-bot
```

### 自动重启设置

PM2 已配置自动重启策略：
- 内存使用超过 1GB 时重启
- 应用崩溃时自动重启
- 每天凌晨 2 点定时重启
- 最多重启 10 次

## 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
npm install

# 3. 重载应用（零停机时间）
./start.sh reload

# 或
pm2 reload starminer-bot
```

## 故障排除

### 常见问题

1. **Bot 无法启动**
   ```bash
   # 检查环境变量
   cat .env
   
   # 检查日志
   pm2 logs starminer-bot --err
   ```

2. **权限问题**
   ```bash
   # 确保启动脚本可执行
   chmod +x start.sh
   
   # 检查文件所有者
   ls -la
   ```

3. **端口冲突**
   ```bash
   # 检查端口使用
   netstat -tulpn | grep :3000
   ```

4. **内存不足**
   ```bash
   # 查看内存使用
   free -h
   
   # 调整 PM2 内存限制
   vim ecosystem.config.js
   ```

### 紧急停止

```bash
# 立即停止所有相关进程
pm2 kill

# 或使用系统服务
sudo systemctl stop starminer-bot
```

## 性能优化

### 系统级优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化网络参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
sysctl -p
```

### PM2 优化

根据服务器配置调整 `ecosystem.config.js`：

```javascript
// 多实例负载均衡（如果需要）
instances: 'max', // 或具体数字

// 内存使用优化
max_memory_restart: '512M', // 根据实际情况调整
```

## 备份策略

```bash
# 备份数据库
cp starminer.db starminer.db.backup.$(date +%Y%m%d_%H%M%S)

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env ecosystem.config.js

# 定期备份（添加到 crontab）
0 2 * * * cd /path/to/your/tgbot && cp starminer.db starminer.db.backup.$(date +\%Y\%m\%d)
```

## 安全建议

1. **环境变量安全**
   ```bash
   # 设置适当的文件权限
   chmod 600 .env
   ```

2. **防火墙设置**
   ```bash
   # 只开放必要端口
   sudo ufw allow ssh
   sudo ufw enable
   ```

3. **定期更新**
   ```bash
   # 定期更新系统包
   sudo apt update && sudo apt upgrade
   
   # 更新 Node.js 依赖
   npm audit fix
   ```

## 联系支持

如果遇到问题，请：
1. 检查日志文件：`./start.sh logs`
2. 查看 GitHub Issues
3. 联系维护团队

---

*最后更新：$(date '+%Y-%m-%d')*