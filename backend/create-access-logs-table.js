const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function createAccessLogsTable() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('检查并创建access_logs表...');

    // 查看所有表
    const tables = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('现有表:');
    tables.forEach(table => {
      console.log(`  ${table.name}`);
    });

    const hasAccessLogs = tables.some(t => t.name === 'access_logs');
    console.log(`access_logs表存在: ${hasAccessLogs}`);

    if (!hasAccessLogs) {
      console.log('创建access_logs表...');

      await new Promise((resolve, reject) => {
        db.run(`CREATE TABLE access_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip_address TEXT,
          user_agent TEXT,
          page_url TEXT,
          referrer TEXT,
          user_id INTEGER,
          session_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log('access_logs表创建成功');

      // 插入一些测试数据
      const testData = [
        ['127.0.0.1', 'Mozilla/5.0', '/', null, 1, 'session1'],
        ['127.0.0.1', 'Mozilla/5.0', '/admin', null, 1, 'session1'],
        ['127.0.0.1', 'Mozilla/5.0', '/dashboard', null, 1, 'session1'],
        ['8.154.36.16', 'curl/8.14.1', '/api/auth/login', null, 1, 'api_session'],
        ['8.154.36.16', 'curl/8.14.1', '/api/admin/users', null, 1, 'api_session']
      ];

      for (const data of testData) {
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO access_logs (ip_address, user_agent, page_url, referrer, user_id, session_id) VALUES (?, ?, ?, ?, ?, ?)', data, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      console.log('插入测试数据完成');
    }

    // 检查数据
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM access_logs', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`access_logs表记录数: ${count}`);

  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    db.close();
  }
}

createAccessLogsTable();