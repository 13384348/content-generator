const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'content_generator.db');

// 安全的数据库初始化 - 只创建表结构，不插入默认数据
function initDatabase() {
  const db = new sqlite3.Database(dbPath);

  // 创建提示词表
  db.serialize(() => {
    // 提示词模板表
    db.run(`CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_type TEXT NOT NULL,
      industry TEXT NOT NULL,
      generated_topics TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 钩子提示词表
    db.run(`CREATE TABLE IF NOT EXISTS hook_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 钩子生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS hook_generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hook_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      generated_hooks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 文案提示词表
    db.run(`CREATE TABLE IF NOT EXISTS content_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 文案生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS content_generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_type TEXT NOT NULL,
      topic TEXT NOT NULL,
      hook TEXT NOT NULL,
      generated_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 分镜脚本提示词表
    db.run(`CREATE TABLE IF NOT EXISTS storyboard_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 分镜脚本生成历史表
    db.run(`CREATE TABLE IF NOT EXISTS storyboard_generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      storyboard_type TEXT NOT NULL,
      input_content TEXT NOT NULL,
      generated_storyboard TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 爆款文案二创提示词表
    db.run(`CREATE TABLE IF NOT EXISTS explosive_recreation_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 爆款文案二创历史表
    db.run(`CREATE TABLE IF NOT EXISTS explosive_recreation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_content TEXT NOT NULL,
      recreated_content TEXT NOT NULL,
      recreation_type TEXT,
      target_platforms TEXT,
      creativity_level INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('数据库表结构初始化完成');
    console.log('⚠️  重要：为保护用户自定义内容，已跳过所有默认数据插入');
    console.log('📝 用户可通过管理后台手动添加或导入提示词');
  });

  db.close();
}

module.exports = { initDatabase, dbPath };