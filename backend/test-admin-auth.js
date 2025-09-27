const UsageService = require('./services/usageService');

// 测试管理员权限
async function testAdminAuth() {
  const usageService = new UsageService();

  console.log('测试管理员权限...');

  // 模拟管理员用户ID（需要从数据库中获取真实的管理员用户ID）
  const adminUserId = 1; // 假设管理员用户ID是1，实际需要查询数据库

  try {
    const result = await usageService.canUseFeature(adminUserId, null);
    console.log('管理员权限测试结果:', result);

    if (result.canUse && result.type === 'admin') {
      console.log('✅ 管理员权限正常，无限制使用');
    } else {
      console.log('❌ 管理员权限异常，被限制使用');
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }

  usageService.close();
}

// 查询管理员用户信息
async function getAdminUserInfo() {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, 'database', 'content_generator.db');
  const db = new sqlite3.Database(dbPath);

  const adminEmails = ['ok47584@126.com', '2918707003@qq.com'];

  for (const email of adminEmails) {
    await new Promise((resolve) => {
      db.get('SELECT id, email FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          console.error(`查询 ${email} 失败:`, err);
        } else if (row) {
          console.log(`管理员账户: ID=${row.id}, Email=${row.email}`);
          testAdminAuthForUser(row.id);
        } else {
          console.log(`未找到管理员账户: ${email}`);
        }
        resolve();
      });
    });
  }

  db.close();
}

async function testAdminAuthForUser(userId) {
  const usageService = new UsageService();

  try {
    const result = await usageService.canUseFeature(userId, null);
    console.log(`用户ID ${userId} 权限测试结果:`, result);

    if (result.canUse && result.type === 'admin') {
      console.log(`✅ 用户ID ${userId} 管理员权限正常`);
    } else {
      console.log(`❌ 用户ID ${userId} 管理员权限异常:`, result);
    }
  } catch (error) {
    console.error(`用户ID ${userId} 测试失败:`, error.message);
  }

  usageService.close();
}

getAdminUserInfo();