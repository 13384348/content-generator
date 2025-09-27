@echo off
echo 🔧 修复服务器数据库问题...
echo.

echo 1. 停止服务器服务...
ssh root@8.154.36.16 "pkill -f 'node.*server.js' || true"

echo 2. 备份服务器现有数据库...
ssh root@8.154.36.16 "mkdir -p /opt/content-generator/backend/database"
ssh root@8.154.36.16 "if [ -f '/opt/content-generator/backend/database/content_generator.db' ]; then cp '/opt/content-generator/backend/database/content_generator.db' '/opt/content-generator/backend/database/content_generator.db.backup'; fi"

echo 3. 上传本地数据库到服务器...
scp backend/database/content_generator.db root@8.154.36.16:/opt/content-generator/backend/database/

echo 4. 在服务器上重置管理员密码...
ssh root@8.154.36.16 "cd /opt/content-generator/backend && node -e \"
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function resetAdminPasswords() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('重置管理员密码...');

    const adminAccounts = [
      { email: 'ok47584@126.com', password: '112233' },
      { email: '2918707003@qq.com', password: '112233' }
    ];

    for (const admin of adminAccounts) {
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [admin.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (user) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        await new Promise((resolve, reject) => {
          db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, admin.email], function(err) {
            if (err) reject(err);
            else {
              console.log(\`已重置 \${admin.email} 的密码\`);
              resolve();
            }
          });
        });
      } else {
        console.log(\`用户 \${admin.email} 不存在\`);
      }
    }

    console.log('密码重置完成！');
  } catch (error) {
    console.error('重置密码时出错:', error);
  } finally {
    db.close();
  }
}

resetAdminPasswords();
\""

echo 5. 重新启动服务...
ssh root@8.154.36.16 "cd /opt/content-generator/backend && nohup node server.js > app.log 2>&1 &"

echo 6. 等待服务启动...
timeout /t 5 /nobreak >nul

echo 7. 测试登录API...
curl -X POST http://8.154.36.16:5004/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"ok47584@126.com\",\"password\":\"112233\"}"

echo.
echo 修复完成！
pause