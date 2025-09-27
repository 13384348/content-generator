const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// 数据库路径 - 使用与服务器相同的路径
const dbPath = path.join(__dirname, 'database', 'content_generator.db');

// 直接创建管理员账号
async function createAdminAccounts() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('连接到数据库:', dbPath);

    // 准备管理员账号数据
    const adminAccounts = [
      {
        email: 'ok47584@126.com',
        password: '112233'
      },
      {
        email: '2918707003@qq.com',
        password: '112233'
      }
    ];

    // 生成随机推荐码
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    for (const admin of adminAccounts) {
      // 检查用户是否已存在
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [admin.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        // 更新现有用户为管理员 - 注意这个表没有type字段，我们需要添加标识
        await new Promise((resolve, reject) => {
          // 用username字段标识管理员
          db.run('UPDATE users SET username = ? WHERE email = ?', ['admin', admin.email], function(err) {
            if (err) reject(err);
            else {
              console.log(`已将现有用户 ${admin.email} 更新为管理员`);
              resolve();
            }
          });
        });
      } else {
        // 创建新的管理员账号
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const referralCode = generateReferralCode();

        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO users (email, password_hash, username, referral_code, free_usage_count, paid_usage_count, total_purchased, is_registered)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [admin.email, hashedPassword, 'admin', referralCode, 999999, 0, 0, 1],
            function(err) {
              if (err) reject(err);
              else {
                console.log(`成功创建管理员账号: ${admin.email}`);
                resolve();
              }
            }
          );
        });
      }
    }

    console.log('\n管理员账号创建/更新完成！');
    console.log('管理员账号列表：');
    console.log('1. 邮箱: ok47584@126.com, 密码: 112233');
    console.log('2. 邮箱: 2918707003@qq.com, 密码: 112233');
    console.log('\n现在可以使用这些邮箱登录管理后台了！');

  } catch (error) {
    console.error('创建管理员账号时出错:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

createAdminAccounts();