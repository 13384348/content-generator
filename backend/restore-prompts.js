const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function restorePrompts(backupFile) {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('开始恢复提示词数据...');
    console.log(`备份文件: ${backupFile}`);

    // 读取备份文件
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    console.log(`备份时间: ${backupData.timestamp}`);
    console.log(`备份内容统计：`);
    console.log(`- 基础提示词: ${backupData.prompts.length} 条`);
    console.log(`- 钩子提示词: ${backupData.hookPrompts.length} 条`);
    console.log(`- 文案提示词: ${backupData.contentPrompts.length} 条`);
    console.log(`- 分镜脚本提示词: ${backupData.storyboardPrompts.length} 条`);

    // 清空现有数据并恢复
    await new Promise((resolve, reject) => {
      db.serialize(async () => {
        try {
          // 清空所有提示词表
          db.run('DELETE FROM prompts');
          db.run('DELETE FROM hook_prompts');
          db.run('DELETE FROM content_prompts');
          db.run('DELETE FROM storyboard_prompts');

          console.log('已清空现有提示词数据');

          // 恢复基础提示词
          if (backupData.prompts && backupData.prompts.length > 0) {
            const stmt = db.prepare("INSERT INTO prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
            backupData.prompts.forEach(prompt => {
              stmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
            });
            stmt.finalize();
            console.log(`✅ 恢复基础提示词: ${backupData.prompts.length} 条`);
          }

          // 恢复钩子提示词
          if (backupData.hookPrompts && backupData.hookPrompts.length > 0) {
            const hookStmt = db.prepare("INSERT INTO hook_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
            backupData.hookPrompts.forEach(prompt => {
              hookStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
            });
            hookStmt.finalize();
            console.log(`✅ 恢复钩子提示词: ${backupData.hookPrompts.length} 条`);
          }

          // 恢复文案提示词
          if (backupData.contentPrompts && backupData.contentPrompts.length > 0) {
            const contentStmt = db.prepare("INSERT INTO content_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
            backupData.contentPrompts.forEach(prompt => {
              contentStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
            });
            contentStmt.finalize();
            console.log(`✅ 恢复文案提示词: ${backupData.contentPrompts.length} 条`);
          }

          // 恢复分镜脚本提示词
          if (backupData.storyboardPrompts && backupData.storyboardPrompts.length > 0) {
            const storyboardStmt = db.prepare("INSERT INTO storyboard_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
            backupData.storyboardPrompts.forEach(prompt => {
              storyboardStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
            });
            storyboardStmt.finalize();
            console.log(`✅ 恢复分镜脚本提示词: ${backupData.storyboardPrompts.length} 条`);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    console.log('\n🎉 提示词恢复完成！');
    console.log('您的原始提示词已完全恢复');

  } catch (error) {
    console.error('❌ 恢复失败:', error);
  } finally {
    db.close();
  }
}

// 自动查找最新的备份文件
function findLatestBackup() {
  const backupFiles = fs.readdirSync(__dirname)
    .filter(file => file.startsWith('prompts-backup-') && file.endsWith('.json'))
    .sort()
    .reverse();

  return backupFiles.length > 0 ? path.join(__dirname, backupFiles[0]) : null;
}

const backupFile = process.argv[2] || findLatestBackup();

if (!backupFile || !fs.existsSync(backupFile)) {
  console.error('❌ 找不到备份文件');
  console.log('使用方法: node restore-prompts.js [备份文件路径]');
  process.exit(1);
}

restorePrompts(backupFile);