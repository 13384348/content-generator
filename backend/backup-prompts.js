const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function backupPrompts() {
  const db = new sqlite3.Database(dbPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    console.log('开始备份所有提示词数据...');

    // 备份基础提示词
    const prompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM prompts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 备份钩子提示词
    const hookPrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM hook_prompts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 备份文案提示词
    const contentPrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM content_prompts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 备份分镜脚本提示词
    const storyboardPrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM storyboard_prompts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const backupData = {
      timestamp: new Date().toISOString(),
      prompts,
      hookPrompts,
      contentPrompts,
      storyboardPrompts
    };

    const backupFile = path.join(__dirname, `prompts-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');

    console.log(`备份完成！文件保存为: ${backupFile}`);
    console.log(`备份内容统计：`);
    console.log(`- 基础提示词: ${prompts.length} 条`);
    console.log(`- 钩子提示词: ${hookPrompts.length} 条`);
    console.log(`- 文案提示词: ${contentPrompts.length} 条`);
    console.log(`- 分镜脚本提示词: ${storyboardPrompts.length} 条`);

  } catch (error) {
    console.error('备份失败:', error);
  } finally {
    db.close();
  }
}

backupPrompts();