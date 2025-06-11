#!/bin/bash

# StarMiner Bot 启动脚本
# 使用方法: ./start.sh [start|stop|restart|status|logs]

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="starminer-bot"

cd "$PROJECT_DIR"

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "❌ 错误: 找不到 .env 文件"
    echo "请复制 .env.example 到 .env 并配置必要的环境变量"
    exit 1
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ 错误: PM2 未安装"
    echo "请运行: npm install -g pm2"
    exit 1
fi

# 创建日志目录
mkdir -p logs

case "$1" in
    start)
        echo "🚀 启动 StarMiner Bot..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        echo "✅ Bot 已启动"
        echo "📊 查看状态: pm2 status"
        echo "📝 查看日志: pm2 logs $APP_NAME"
        ;;
    stop)
        echo "⏹️  停止 StarMiner Bot..."
        pm2 stop $APP_NAME
        echo "✅ Bot 已停止"
        ;;
    restart)
        echo "🔄 重启 StarMiner Bot..."
        pm2 restart $APP_NAME
        echo "✅ Bot 已重启"
        ;;
    reload)
        echo "🔄 重载 StarMiner Bot..."
        pm2 reload $APP_NAME
        echo "✅ Bot 已重载"
        ;;
    status)
        echo "📊 StarMiner Bot 状态:"
        pm2 status $APP_NAME
        ;;
    logs)
        echo "📝 查看实时日志 (Ctrl+C 退出):"
        pm2 logs $APP_NAME --lines 50
        ;;
    monit)
        echo "📊 启动监控面板:"
        pm2 monit
        ;;
    delete)
        echo "🗑️  删除 StarMiner Bot 进程..."
        pm2 delete $APP_NAME
        echo "✅ 进程已删除"
        ;;
    install-service)
        echo "🔧 安装系统服务..."
        # 更新服务文件中的路径
        sed -i "s|/path/to/your/tgbot|$PROJECT_DIR|g" starminer-bot.service
        sed -i "s|your-username|$USER|g" starminer-bot.service
        
        sudo cp starminer-bot.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable starminer-bot
        echo "✅ 系统服务已安装"
        echo "🚀 启动服务: sudo systemctl start starminer-bot"
        ;;
    *)
        echo "🤖 StarMiner Bot 管理脚本"
        echo ""
        echo "使用方法: $0 {start|stop|restart|reload|status|logs|monit|delete|install-service}"
        echo ""
        echo "命令说明:"
        echo "  start          - 启动 bot"
        echo "  stop           - 停止 bot"
        echo "  restart        - 重启 bot"
        echo "  reload         - 重载 bot (零停机时间)"
        echo "  status         - 查看 bot 状态"
        echo "  logs           - 查看实时日志"
        echo "  monit          - 启动监控面板"
        echo "  delete         - 删除 bot 进程"
        echo "  install-service - 安装为系统服务"
        echo ""
        exit 1
        ;;
esac