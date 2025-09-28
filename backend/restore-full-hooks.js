const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const currentDbPath = path.join(__dirname, 'database', 'content_generator.db');
const backupDbPath = 'D:/YUNYIN/content-generator-versions/version3-step-wizard/backup-20250927_215845/code/backend/database/content_generator.db';

async function restoreFullHooks() {
  console.log('🔄 开始恢复完整的37条钩子提示词...');

  // 从备份数据库读取完整的钩子提示词
  const backupDb = new sqlite3.Database(backupDbPath);
  const currentDb = new sqlite3.Database(currentDbPath);

  try {
    // 读取备份数据库中的所有钩子提示词
    const hookPrompts = await new Promise((resolve, reject) => {
      backupDb.all('SELECT * FROM hook_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📦 从备份中读取到 ${hookPrompts.length} 条钩子提示词`);

    // 清空当前数据库的钩子提示词表
    await new Promise((resolve, reject) => {
      currentDb.run('DELETE FROM hook_prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🗑️  已清空当前钩子提示词数据');

    // 插入完整的钩子提示词
    const stmt = currentDb.prepare("INSERT INTO hook_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");

    hookPrompts.forEach(prompt => {
      stmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
    });

    stmt.finalize();

    console.log(`✅ 成功恢复 ${hookPrompts.length} 条钩子提示词！`);

    // 验证恢复结果
    const count = await new Promise((resolve, reject) => {
      currentDb.get('SELECT COUNT(*) as count FROM hook_prompts', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`🔍 验证：当前数据库中有 ${count} 条钩子提示词`);

    // 显示所有钩子提示词列表
    const allHooks = await new Promise((resolve, reject) => {
      currentDb.all('SELECT type, name FROM hook_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📋 完整钩子提示词列表：');
    allHooks.forEach((hook, index) => {
      console.log(`  ${index + 1}. ${hook.type}: ${hook.name}`);
    });

    console.log('\n🎉 您的37条钩子提示词已完全恢复！');

  } catch (error) {
    console.error('❌ 恢复失败:', error);
  } finally {
    backupDb.close();
    currentDb.close();
  }
}

restoreFullHooks();