#!/bin/bash

# 🚀 Content Generator 自动部署脚本
# 请在服务器上执行此脚本

echo "🚀 开始部署 Content Generator..."
echo "时间: $(date)"
echo

# 1. 停止旧服务
echo "⏹️ 停止旧服务..."
pkill -f 'node.*server.js' || true
echo "✅ 旧服务已停止"
echo

# 2. 备份旧代码
echo "📦 备份旧代码..."
if [ -d "/opt/content-generator" ]; then
    BACKUP_NAME="/opt/content-generator-backup-$(date +%Y%m%d-%H%M%S)"
    mv "/opt/content-generator" "$BACKUP_NAME"
    echo "✅ 已备份旧代码到: $BACKUP_NAME"
else
    echo "ℹ️ 未找到旧代码，跳过备份"
fi
echo

# 3. 克隆最新代码
echo "📥 克隆最新代码..."
cd /opt
if git clone https://github.com/13384348/content-generator.git; then
    echo "✅ 代码克隆成功"
else
    echo "❌ 代码克隆失败"
    exit 1
fi
echo

# 4. 安装后端依赖
echo "📦 安装后端依赖..."
cd /opt/content-generator/backend
if npm install --production; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo

# 5. 构建前端
echo "🏗️ 构建前端..."
cd /opt/content-generator/frontend
if npm install && npm run build; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi
echo

# 6. 配置生产环境
echo "⚙️ 配置生产环境..."
cd /opt/content-generator/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=5004
APP_NAME=ContentGenerator

# AI服务配置
DEEPSEEK_API_KEY=sk-7d1faa1d671a4ba3b20a07758c930e42
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# JWT配置
JWT_SECRET=content_generator_jwt_secret_2025
JWT_EXPIRES_IN=7d

# 管理员配置
ADMIN_PASSWORD=admin123

# 监控配置
LOG_LEVEL=info

# CORS配置
CORS_ORIGIN=http://8.154.36.16
EOF
echo "✅ 环境配置完成"
echo

# 7. 启动服务
echo "🚀 启动服务..."
cd /opt/content-generator/backend
nohup node server.js > app.log 2>&1 &
echo "✅ 服务已启动"
echo

# 8. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 9. 健康检查
echo "🔍 执行健康检查..."
if curl -f http://localhost:5004/api/health > /dev/null 2>&1; then
    echo "✅ 健康检查通过"
else
    echo "⚠️ 健康检查失败，请检查日志"
    echo "查看日志: tail -20 /opt/content-generator/backend/app.log"
fi
echo

# 10. 部署完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 🎉 部署完成！"
echo
echo "📊 部署信息:"
echo "  🌐 网站地址: http://8.154.36.16:5004"
echo "  📁 部署路径: /opt/content-generator"
echo "  ⏰ 部署时间: $(date)"
echo
echo "🔍 快速检查命令:"
echo "  服务状态: ps aux | grep node"
echo "  查看日志: tail -f /opt/content-generator/backend/app.log"
echo "  重启服务: cd /opt/content-generator/backend && pkill -f node && nohup node server.js > app.log 2>&1 &"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo