#!/bin/bash

# 内容生成器部署脚本
set -e

echo "🚀 开始部署内容生成器应用..."

# 检查必要的工具
command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装，请先安装 Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose 未安装，请先安装 Docker Compose"; exit 1; }

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "请编辑 .env 文件，设置正确的环境变量"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs uploads nginx/ssl

# 构建前端
echo "🔨 构建前端应用..."
cd frontend
npm ci
npm run build
cd ..

# 构建和启动容器
echo "🐳 构建和启动 Docker 容器..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 检查服务健康状态..."
if docker-compose exec app curl -f http://localhost:5004/api/health >/dev/null 2>&1; then
    echo "✅ 应用服务启动成功!"
else
    echo "❌ 应用服务启动失败，请检查日志"
    docker-compose logs app
    exit 1
fi

if docker-compose exec nginx curl -f http://localhost/nginx-health >/dev/null 2>&1; then
    echo "✅ Nginx 服务启动成功!"
else
    echo "❌ Nginx 服务启动失败，请检查日志"
    docker-compose logs nginx
    exit 1
fi

# 显示服务状态
echo "📊 服务状态:"
docker-compose ps

echo "🎉 部署完成!"
echo "📝 应用访问地址: https://your-domain.com"
echo "📋 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"

# 显示下一步操作
cat <<EOF

🔧 下一步操作:
1. 配置域名 DNS 解析到服务器 IP
2. 生成并配置 SSL 证书:
   - 使用 Let's Encrypt: certbot --nginx -d your-domain.com
   - 或将证书文件放到 nginx/ssl/ 目录
3. 更新 nginx/nginx.conf 中的 server_name
4. 设置定时备份: crontab -e
5. 配置监控和日志轮转

EOF