const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend/database/content_generator.db');
const db = new sqlite3.Database(dbPath);

console.log('检查数据库状态...');

// 检查钩子提示词数据
db.all("SELECT COUNT(*) as count FROM hook_prompts", (err, rows) => {
  if (err) {
    console.error('查询hook_prompts表失败:', err.message);
    return;
  }
  console.log(`hook_prompts表中有 ${rows[0].count} 条记录`);

  // 检查具体的钩子类型
  db.all("SELECT type, name FROM hook_prompts", (err, rows) => {
    if (err) {
      console.error('查询hook_prompts详情失败:', err.message);
      return;
    }
    console.log('现有钩子类型:');
    rows.forEach(row => {
      console.log(`- ${row.type}: ${row.name}`);
    });

    db.close();
  });
});