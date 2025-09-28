const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function clearAccessLogs() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('开始清空访问统计数据...');

    // 清空access_logs表的所有数据
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM access_logs', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('访问统计数据已清空');

    // 重置自增ID
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence WHERE name = "access_logs"', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('自增ID已重置');

    // 验证清空结果
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM access_logs', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`清空完成，当前记录数: ${count}`);
    console.log('访问统计将从现在开始重新记录真实访问数据');

  } catch (error) {
    console.error('清空失败:', error);
  } finally {
    db.close();
  }
}

clearAccessLogs();