@echo off
echo 开始部署到服务器...

echo 1. 检查服务器连接...
ssh -o ConnectTimeout=10 root@8.154.36.16 "echo 'Connected'"
if errorlevel 1 (
    echo 服务器连接失败
    pause
    exit /b 1
)

echo 2. 停止旧服务...
ssh root@8.154.36.16 "pkill -f 'node.*server.js' || true"

echo 3. 备份旧代码...
ssh root@8.154.36.16 "if [ -d '/opt/content-generator' ]; then mv '/opt/content-generator' '/opt/content-generator-backup-%date:~0,4%%date:~5,2%%date:~8,2%'; fi"

echo 4. 克隆最新代码...
ssh root@8.154.36.16 "cd /opt && git clone https://github.com/13384348/content-generator.git"

echo 5. 安装后端依赖...
ssh root@8.154.36.16 "cd /opt/content-generator/backend && npm install --production"

echo 6. 构建前端...
ssh root@8.154.36.16 "cd /opt/content-generator/frontend && npm install && npm run build"

echo 7. 启动服务...
ssh root@8.154.36.16 "cd /opt/content-generator/backend && nohup node server.js > app.log 2>&1 &"

echo 8. 健康检查...
timeout /t 5 /nobreak >nul
ssh root@8.154.36.16 "curl -f http://localhost:5004/api/health"

echo 部署完成！
pause