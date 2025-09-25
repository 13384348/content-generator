const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('./init');

// 创建单个数据库连接实例
let db = null;

// 获取数据库连接
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接失败:', err.message);
      } else {
        console.log('数据库连接成功');
      }
    });
  }
  return db;
}

// 关闭数据库连接（仅在应用退出时调用）
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('数据库关闭失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
    db = null;
  }
}

// 应用退出时关闭数据库连接
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});

module.exports = { getDatabase, closeDatabase };