const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const db = new sqlite3.Database(dbPath);

console.log('正在修复generation_history表，添加user_id字段...');

// 添加user_id字段到generation_history表
db.run("ALTER TABLE generation_history ADD COLUMN user_id INTEGER", (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('user_id字段已存在，无需添加');
    } else {
      console.error('添加user_id字段失败:', err);
    }
  } else {
    console.log('成功添加user_id字段到generation_history表');
  }

  // 验证表结构
  db.all("PRAGMA table_info(generation_history)", (err, rows) => {
    if (err) {
      console.error('验证表结构失败:', err);
    } else {
      console.log('修复后的generation_history表字段:');
      rows.forEach(r => console.log(`  ${r.name}: ${r.type}`));
    }

    // 测试查询用户历史（应该不再报错）
    db.all("SELECT id, prompt_type, industry, generated_topics, user_id, created_at FROM generation_history LIMIT 3", (err, result) => {
      if (err) {
        console.error('测试查询失败:', err);
      } else {
        console.log('测试查询成功，前3条记录:', result);
      }
      db.close();
    });
  });
});