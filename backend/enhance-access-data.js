const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function enhanceAccessData() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('增强访问统计数据...');

    // 清除旧的测试数据
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM access_logs', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('已清除旧数据');

    // 生成丰富的测试数据
    const testData = [
      // 首页访问
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/', null, 1, 'session_001'],
      ['192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '/', null, 2, 'session_002'],
      ['192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', '/', null, null, 'session_003'],

      // 管理员后台
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/admin', '/', 1, 'session_001'],
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/admin/dashboard', '/admin', 1, 'session_001'],
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/admin/users', '/admin/dashboard', 1, 'session_001'],
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/admin/statistics', '/admin/users', 1, 'session_001'],

      // 内容生成页面
      ['192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '/content-generator', '/', 2, 'session_002'],
      ['192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '/content-generator/hooks', '/content-generator', 2, 'session_002'],
      ['192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '/content-generator/scripts', '/content-generator', 2, 'session_002'],
      ['192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS)', '/content-generator', '/', null, 'session_003'],

      // 用户中心
      ['192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '/user-center', '/content-generator', 2, 'session_002'],
      ['192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/user-center', '/admin', 1, 'session_001'],

      // API访问
      ['192.168.1.100', 'curl/8.14.1', '/api/auth/login', null, null, 'api_session_001'],
      ['192.168.1.100', 'curl/8.14.1', '/api/admin/users', null, 1, 'api_session_002'],
      ['192.168.1.101', 'axios/1.6.0', '/api/content/generate', null, 2, 'api_session_003'],
      ['192.168.1.102', 'fetch', '/api/auth/register', null, null, 'api_session_004'],

      // 历史数据（过去几天）
      ['192.168.1.103', 'Mozilla/5.0 (Linux; Android)', '/', null, null, 'session_004'],
      ['192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0)', '/content-generator', '/', null, 'session_005'],
      ['192.168.1.105', 'Mozilla/5.0 (Macintosh)', '/admin', '/', 1, 'session_006'],
    ];

    // 插入当天数据
    console.log('插入当天访问数据...');
    for (const data of testData.slice(0, 17)) {
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO access_logs (ip_address, user_agent, page_url, referrer, user_id, session_id) VALUES (?, ?, ?, ?, ?, ?)', data, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 插入昨天的数据
    console.log('插入历史访问数据...');
    for (const data of testData.slice(17)) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO access_logs (ip_address, user_agent, page_url, referrer, user_id, session_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-1 day'))`, data, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 插入更早的数据（本周）
    const weekData = [
      ['192.168.1.106', 'Mozilla/5.0', '/', null, null, 'session_007'],
      ['192.168.1.107', 'Mozilla/5.0', '/content-generator', '/', null, 'session_008'],
      ['192.168.1.108', 'Mozilla/5.0', '/admin', '/', 1, 'session_009'],
    ];

    for (const data of weekData) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO access_logs (ip_address, user_agent, page_url, referrer, user_id, session_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-3 days'))`, data, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 检查插入结果
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM access_logs', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`访问数据增强完成，共插入 ${count} 条记录`);

    // 显示统计
    const todayCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) = DATE("now")', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const uniqueToday = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(DISTINCT ip_address) as count FROM access_logs WHERE DATE(created_at) = DATE("now")', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`今日访问: ${todayCount} 次`);
    console.log(`今日独立访客: ${uniqueToday} 个`);

  } catch (error) {
    console.error('增强数据失败:', error);
  } finally {
    db.close();
  }
}

enhanceAccessData();