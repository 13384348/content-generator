const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function createSharedAccount() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('创建共享账号...');

    const email = 'mtq@666.com';
    const password = '123';
    const username = 'mtq共享账号';

    // 检查账号是否已存在
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      console.log('账号已存在，更新账号信息...');

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 更新现有账号
      await new Promise((resolve, reject) => {
        db.run(`UPDATE users SET
                 password_hash = ?,
                 username = ?,
                 free_usage_count = 999999,
                 paid_usage_count = 0,
                 subscription_status = 'active',
                 monthly_usage_limit = 999999,
                 is_registered = 1
                 WHERE email = ?`,
                [hashedPassword, username, email], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('共享账号更新成功！');
    } else {
      console.log('创建新的共享账号...');

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 生成推荐码
      const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // 插入新账号
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (
                 email, password_hash, username,
                 free_usage_count, paid_usage_count,
                 subscription_status, monthly_usage_limit,
                 referral_code, is_registered, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [email, hashedPassword, username, 999999, 0, 'active', 999999, referralCode, 1], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('共享账号创建成功！');
    }

    // 验证账号信息
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('账号信息确认：');
    console.log(`邮箱: ${user.email}`);
    console.log(`用户名: ${user.username}`);
    console.log(`密码: ${password}`);
    console.log(`免费使用次数: ${user.free_usage_count}`);
    console.log(`每月使用限制: ${user.monthly_usage_limit}`);
    console.log(`订阅状态: ${user.subscription_status}`);
    console.log(`推荐码: ${user.referral_code}`);
    console.log(`已注册: ${user.is_registered ? '是' : '否'}`);

    console.log('\n共享账号创建完成！');
    console.log('账号特点：');
    console.log('- 拥有无限使用次数（999999次）');
    console.log('- 不具备管理员权限，无法访问后台');
    console.log('- 可以正常使用所有内容生成功能');
    console.log('- 支持多人同时使用同一账号');
    console.log('- 适合作为公共体验账号');

  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    db.close();
  }
}

createSharedAccount();