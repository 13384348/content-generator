const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, 'database.db');

// 删除旧管理员账号并创建新的邮箱格式管理员账号
async function updateAdminAccounts() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('开始更新管理员账号...');

    // 删除旧的管理员账号（从admins表，如果存在的话）
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM admins WHERE username IN (?, ?)', ['yinbinfei', 'wuyingdong'], function(err) {
        if (err && !err.message.includes('no such table')) {
          reject(err);
        } else {
          if (err) {
            console.log('admins表不存在，跳过删除旧管理员账号');
          } else {
            console.log(`删除了 ${this.changes} 个旧管理员账号`);
          }
          resolve();
        }
      });
    });

    // 准备新的管理员账号数据（存储在users表中，带有admin标记）
    const newAdmins = [
      {
        email: 'ok47584@126.com',
        password: '112233',
        type: 'admin'
      },
      {
        email: '2918707003@qq.com',
        password: '112233',
        type: 'admin'
      }
    ];

    // 删除已存在的同邮箱用户（如果有的话）
    for (const admin of newAdmins) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE email = ?', [admin.email], function(err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes > 0) {
              console.log(`删除已存在的用户: ${admin.email}`);
            }
            resolve();
          }
        });
      });
    }

    // 创建新的管理员账号（存储在users表中）
    for (const admin of newAdmins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password, type, freeUsageLimit, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
          [admin.email, hashedPassword, admin.type, 999999], // 给管理员大量免费使用次数
          function(err) {
            if (err) {
              reject(err);
            } else {
              console.log(`创建管理员账号: ${admin.email}`);
              resolve();
            }
          }
        );
      });
    }

    console.log('管理员账号更新完成！');
    console.log('新的管理员账号:');
    console.log('1. 邮箱: ok47584@126.com, 密码: 112233');
    console.log('2. 邮箱: 2918707003@qq.com, 密码: 112233');
    console.log('现在可以使用普通登录界面登录这些管理员账号了。');

  } catch (error) {
    console.error('更新管理员账号时出错:', error);
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

updateAdminAccounts();