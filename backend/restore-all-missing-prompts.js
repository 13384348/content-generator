const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 从备份数据库导出所有遗漏的提示词
const backupDbPath = 'D:/YUNYIN/content-generator-versions/version3-step-wizard/backup-20250927_215845/code/backend/database/content_generator.db';

async function exportAllPrompts() {
  const db = new sqlite3.Database(backupDbPath);

  try {
    console.log('📦 从备份数据库导出所有提示词...');

    // 导出基础提示词（选题）
    const prompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 导出文案提示词
    const contentPrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM content_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 导出分镜脚本提示词
    const storyboardPrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM storyboard_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 导出二创提示词
    const explosivePrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM explosive_recreation_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const allData = {
      timestamp: new Date().toISOString(),
      prompts,
      contentPrompts,
      storyboardPrompts,
      explosivePrompts
    };

    // 保存为JSON文件
    fs.writeFileSync('all-missing-prompts.json', JSON.stringify(allData, null, 2));

    console.log('✅ 导出完成！');
    console.log(`📊 基础提示词（选题）: ${prompts.length} 条`);
    console.log(`📊 文案提示词: ${contentPrompts.length} 条`);
    console.log(`📊 分镜脚本提示词: ${storyboardPrompts.length} 条`);
    console.log(`📊 二创提示词: ${explosivePrompts.length} 条`);

    // 显示详细列表
    console.log('\n📋 基础提示词（选题）详细列表：');
    prompts.forEach((p, i) => console.log(`  ${i+1}. ${p.type}: ${p.name}`));

    console.log('\n📋 文案提示词详细列表：');
    contentPrompts.forEach((p, i) => console.log(`  ${i+1}. ${p.type}: ${p.name}`));

    console.log('\n📋 分镜脚本提示词详细列表：');
    storyboardPrompts.forEach((p, i) => console.log(`  ${i+1}. ${p.type}: ${p.name}`));

    console.log('\n📋 二创提示词详细列表：');
    explosivePrompts.forEach((p, i) => {
      const preview = p.prompt.substring(0, 100) + '...';
      console.log(`  ${i+1}. ID ${p.id}: ${preview}`);
    });

  } catch (error) {
    console.error('❌ 导出失败:', error);
  } finally {
    db.close();
  }
}

exportAllPrompts();