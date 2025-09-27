const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 数据库文件路径
const DB_PATH = './database/database.db';

async function createAdminAccounts() {
  const db = new sqlite3.Database(DB_PATH);

  try {
    // 创建管理员表
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('管理员表创建成功');

    // 创建管理员账户
    const adminAccounts = [
      { username: 'yinbinfei', password: '112233', email: 'yinbinfei@admin.com' },
      { username: 'wuyingdong', password: '112233', email: 'wuyingdong@admin.com' }
    ];

    for (const admin of adminAccounts) {
      // 检查管理员是否已存在
      const existingAdmin = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM admins WHERE username = ?', [admin.username], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingAdmin) {
        console.log(`管理员 ${admin.username} 已存在，跳过创建`);
        continue;
      }

      // 加密密码
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(admin.password, saltRounds);

      // 插入管理员账户
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
          [admin.username, passwordHash, admin.email],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(`管理员账户 ${admin.username} 创建成功`);
    }

    // 也为用户表添加 is_admin 字段（如果不存在）
    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('用户表已添加 is_admin 字段');

  } catch (error) {
    console.error('创建管理员账户时发生错误:', error);
  } finally {
    db.close();
  }
}

// 运行脚本
createAdminAccounts().then(() => {
  console.log('管理员账户创建完成');
  process.exit(0);
}).catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});