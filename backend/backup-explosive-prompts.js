const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');

async function backupExplosivePrompts() {
  console.log('🔄 开始备份最新的爆款二创提示词...');

  const db = new sqlite3.Database(dbPath);

  try {
    // 导出二创提示词
    const explosivePrompts = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM explosive_recreation_prompts ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const backupData = {
      timestamp: new Date().toISOString(),
      explosivePrompts,
      count: explosivePrompts.length
    };

    // 保存为JSON文件
    const backupFileName = `explosive-prompts-backup-${new Date().toISOString().slice(0, 19).replace(/[:\-]/g, '').replace('T', '_')}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));

    console.log('✅ 备份完成！');
    console.log(`📅 备份时间: ${backupData.timestamp}`);
    console.log(`📦 二创提示词数量: ${explosivePrompts.length} 条`);
    console.log(`💾 备份文件: ${backupFileName}`);

    // 显示提示词内容预览
    console.log('\n📋 二创提示词内容预览：');
    explosivePrompts.forEach((prompt, index) => {
      const preview = prompt.prompt.length > 100 ?
        prompt.prompt.substring(0, 100) + '...' :
        prompt.prompt;
      console.log(`\n🔥 提示词 ${index + 1} (ID: ${prompt.id}):`);
      console.log(`   ${preview}`);
    });

    console.log(`\n🎉 爆款二创提示词备份完成！文件已保存为: ${backupFileName}`);

  } catch (error) {
    console.error('❌ 备份失败:', error);
  } finally {
    db.close();
  }
}

backupExplosivePrompts();