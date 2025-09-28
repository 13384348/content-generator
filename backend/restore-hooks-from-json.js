const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const jsonFile = path.join(__dirname, 'full-hook-prompts.json');

async function restoreHooksFromJson() {
  console.log('🔄 开始从JSON文件恢复完整的钩子提示词...');

  if (!fs.existsSync(jsonFile)) {
    console.error('❌ 找不到钩子提示词JSON文件:', jsonFile);
    return;
  }

  const db = new sqlite3.Database(dbPath);

  try {
    // 读取JSON文件
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const hookPrompts = data.hookPrompts;

    console.log(`📦 从JSON文件中读取到 ${hookPrompts.length} 条钩子提示词`);
    console.log(`📅 数据时间戳: ${data.timestamp}`);

    // 清空当前数据库的钩子提示词表
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM hook_prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🗑️  已清空当前钩子提示词数据');

    // 插入完整的钩子提示词
    const stmt = db.prepare("INSERT INTO hook_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");

    hookPrompts.forEach(prompt => {
      stmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
    });

    stmt.finalize();

    console.log(`✅ 成功恢复 ${hookPrompts.length} 条钩子提示词！`);

    // 验证恢复结果
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM hook_prompts', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`🔍 验证：当前数据库中有 ${count} 条钩子提示词`);

    // 显示前10个钩子提示词作为验证
    const sampleHooks = await new Promise((resolve, reject) => {
      db.all('SELECT type, name FROM hook_prompts ORDER BY id LIMIT 10', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📋 钩子提示词样例（前10条）：');
    sampleHooks.forEach((hook, index) => {
      console.log(`  ${index + 1}. ${hook.type}: ${hook.name}`);
    });

    console.log(`\n... 还有 ${count - 10} 条钩子提示词`);
    console.log('\n🎉 您的完整钩子提示词已全部恢复！');

  } catch (error) {
    console.error('❌ 恢复失败:', error);
  } finally {
    db.close();
  }
}

restoreHooksFromJson();