const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'content_generator.db');
const jsonFile = path.join(__dirname, 'all-missing-prompts.json');

async function restoreMissingPrompts() {
  console.log('🔄 开始恢复所有遗漏的提示词...');

  if (!fs.existsSync(jsonFile)) {
    console.error('❌ 找不到提示词JSON文件:', jsonFile);
    return;
  }

  const db = new sqlite3.Database(dbPath);

  try {
    // 读取JSON文件
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    console.log(`📅 数据时间戳: ${data.timestamp}`);
    console.log(`📦 基础提示词（选题）: ${data.prompts.length} 条`);
    console.log(`📦 文案提示词: ${data.contentPrompts.length} 条`);
    console.log(`📦 分镜脚本提示词: ${data.storyboardPrompts.length} 条`);
    console.log(`📦 二创提示词: ${data.explosivePrompts.length} 条`);

    // 1. 恢复基础提示词（选题）
    console.log('\n🎯 恢复基础提示词（选题）...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const promptStmt = db.prepare("INSERT INTO prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    data.prompts.forEach(prompt => {
      promptStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
    });
    promptStmt.finalize();
    console.log(`✅ 恢复基础提示词: ${data.prompts.length} 条`);

    // 2. 恢复文案提示词
    console.log('\n📝 恢复文案提示词...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM content_prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const contentStmt = db.prepare("INSERT INTO content_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    data.contentPrompts.forEach(prompt => {
      contentStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
    });
    contentStmt.finalize();
    console.log(`✅ 恢复文案提示词: ${data.contentPrompts.length} 条`);

    // 3. 恢复分镜脚本提示词
    console.log('\n🎬 恢复分镜脚本提示词...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM storyboard_prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const storyboardStmt = db.prepare("INSERT INTO storyboard_prompts (id, type, name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    data.storyboardPrompts.forEach(prompt => {
      storyboardStmt.run(prompt.id, prompt.type, prompt.name, prompt.content, prompt.created_at, prompt.updated_at);
    });
    storyboardStmt.finalize();
    console.log(`✅ 恢复分镜脚本提示词: ${data.storyboardPrompts.length} 条`);

    // 4. 恢复二创提示词
    console.log('\n🔥 恢复二创提示词...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM explosive_recreation_prompts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const explosiveStmt = db.prepare("INSERT INTO explosive_recreation_prompts (id, prompt, created_at, updated_at) VALUES (?, ?, ?, ?)");
    data.explosivePrompts.forEach(prompt => {
      explosiveStmt.run(prompt.id, prompt.prompt, prompt.created_at, prompt.updated_at);
    });
    explosiveStmt.finalize();
    console.log(`✅ 恢复二创提示词: ${data.explosivePrompts.length} 条`);

    // 验证恢复结果
    console.log('\n🔍 验证恢复结果...');

    const verifyTables = [
      {name: 'prompts', desc: '基础提示词（选题）'},
      {name: 'content_prompts', desc: '文案提示词'},
      {name: 'storyboard_prompts', desc: '分镜脚本提示词'},
      {name: 'explosive_recreation_prompts', desc: '二创提示词'}
    ];

    for (const table of verifyTables) {
      const count = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      console.log(`📊 ${table.desc}: ${count} 条`);
    }

    console.log('\n🎉 所有遗漏的提示词已完全恢复！');
    console.log('📝 包括：选题生成、文案生成、分镜脚本、二创功能的所有提示词');

  } catch (error) {
    console.error('❌ 恢复失败:', error);
  } finally {
    db.close();
  }
}

restoreMissingPrompts();