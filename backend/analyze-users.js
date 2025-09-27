const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const db = new sqlite3.Database(dbPath);

console.log('分析无效用户...');

// 查看email为null的用户（这些可能是无效用户）
db.all("SELECT id, email, username, phone, created_at, is_guest, guest_id FROM users WHERE email IS NULL ORDER BY created_at DESC LIMIT 10", (err, nullEmailUsers) => {
  if (err) {
    console.error('查询无邮箱用户错误:', err);
  } else {
    console.log('\n无邮箱用户（前10个）:');
    nullEmailUsers.forEach(user => {
      console.log(\);
    });
  }
  
  // 统计各种类型的用户
  db.get("SELECT COUNT(*) as total FROM users", (err, total) => {
    if (err) return;
    
    db.get("SELECT COUNT(*) as nullEmail FROM users WHERE email IS NULL", (err, nullEmail) => {
      if (err) return;
      
      db.get("SELECT COUNT(*) as hasEmail FROM users WHERE email IS NOT NULL", (err, hasEmail) => {
        if (err) return;
        
        console.log('\n用户统计:');
        console.log(\);
        console.log(\);
        console.log(\);
        
        db.close();
      });
    });
  });
});
