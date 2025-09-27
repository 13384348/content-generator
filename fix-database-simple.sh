#!/bin/bash
echo "修复服务器数据库问题..."

echo "1. 停止服务器服务..."
ssh root@8.154.36.16 "pkill -f 'node.*server.js' || true"

echo "2. 备份服务器现有数据库..."
ssh root@8.154.36.16 "mkdir -p /opt/content-generator/backend/database"

echo "3. 上传本地数据库到服务器..."
scp backend/database/content_generator.db root@8.154.36.16:/opt/content-generator/backend/database/

echo "4. 重新启动服务..."
ssh root@8.154.36.16 "cd /opt/content-generator/backend && nohup node server.js > app.log 2>&1 &"

echo "5. 等待服务启动..."
sleep 5

echo "6. 测试登录API..."
curl -X POST http://8.154.36.16:5004/api/auth/login -H "Content-Type: application/json" -d '{"email":"ok47584@126.com","password":"112233"}'

echo ""
echo "修复完成！"