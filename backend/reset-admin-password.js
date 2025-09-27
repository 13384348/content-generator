const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// 数据库路径
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
      // 检查用户是否存在
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [admin.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (user) {
        // 重置密码
        const hashedPassword = await bcrypt.hash(admin.password, 10);

        await new Promise((resolve, reject) => {
          db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, admin.email], function(err) {
            if (err) reject(err);
            else {
              console.log(`已重置 ${admin.email} 的密码为: ${admin.password}`);
              resolve();
            }
          });
        });
      } else {
        console.log(`用户 ${admin.email} 不存在`);
      }
    }

    console.log('\n密码重置完成！现在可以用以下账号登录：');
    console.log('1. 邮箱: ok47584@126.com, 密码: 112233');
    console.log('2. 邮箱: 2918707003@qq.com, 密码: 112233');

  } catch (error) {
    console.error('重置密码时出错:', error);
  } finally {
    db.close();
  }
}

resetAdminPasswords();