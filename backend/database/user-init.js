const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'content_generator.db');

// 初始化用户系统数据库表
function initUserDatabase() {
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      username TEXT,
      password_hash TEXT,
      avatar_url TEXT,
      is_guest BOOLEAN DEFAULT 0,
      guest_id TEXT UNIQUE,

      -- 使用次数相关
      free_usage_count INTEGER DEFAULT 0,  -- 已使用的免费次数
      paid_usage_count INTEGER DEFAULT 0,   -- 已使用的付费次数
      total_purchased INTEGER DEFAULT 0,    -- 总购买次数

      -- 注册相关
      is_registered BOOLEAN DEFAULT 0,
      registration_bonus_used BOOLEAN DEFAULT 0,  -- 是否已使用注册奖励

      -- 推荐相关
      referral_code TEXT UNIQUE,  -- 自己的推荐码
      referred_by TEXT,           -- 被谁推荐
      referral_rewards INTEGER DEFAULT 0,  -- 推荐获得的奖励次数

      -- 订阅相关
      subscription_type TEXT,     -- 订阅类型：basic, professional
      subscription_status TEXT DEFAULT 'inactive',  -- 订阅状态
      subscription_start_date DATETIME,
      subscription_end_date DATETIME,
      monthly_usage_limit INTEGER DEFAULT 0,  -- 月度使用限制
      monthly_usage_count INTEGER DEFAULT 0,  -- 当月已使用次数
      last_usage_reset_date DATETIME,  -- 上次重置使用次数的日期

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 使用记录表
    db.run(`CREATE TABLE IF NOT EXISTS usage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guest_id TEXT,
      feature_type TEXT NOT NULL,  -- 功能类型：topic, hook, content, storyboard, explosive
      content_type TEXT,           -- 内容类型：story, knowledge等
      input_data TEXT,             -- 输入内容
      output_data TEXT,            -- 输出内容
      usage_type TEXT DEFAULT 'free',  -- 使用类型：free, paid, subscription
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // 订单表
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_no TEXT UNIQUE NOT NULL,
      product_type TEXT NOT NULL,  -- 产品类型：usage_pack, subscription
      product_name TEXT NOT NULL,  -- 产品名称
      quantity INTEGER DEFAULT 1,
      original_price DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      final_price DECIMAL(10,2) NOT NULL,

      -- 支付相关
      payment_method TEXT,  -- 支付方式：alipay, wechat
      payment_status TEXT DEFAULT 'pending',  -- 支付状态：pending, paid, failed, refunded
      payment_time DATETIME,
      transaction_id TEXT,  -- 支付平台交易ID

      -- 订单内容
      usage_count INTEGER DEFAULT 0,  -- 购买的使用次数（次数包）
      subscription_months INTEGER DEFAULT 0,  -- 订阅月数

      expires_at DATETIME,  -- 到期时间
      used_count INTEGER DEFAULT 0,  -- 已使用次数

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // 推荐记录表
    db.run(`CREATE TABLE IF NOT EXISTS referral_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_id INTEGER NOT NULL,  -- 推荐人ID
      referee_id INTEGER NOT NULL,   -- 被推荐人ID
      referral_code TEXT NOT NULL,   -- 使用的推荐码
      reward_given BOOLEAN DEFAULT 0, -- 是否已发放奖励
      referrer_reward INTEGER DEFAULT 5,  -- 推荐人奖励次数
      referee_reward INTEGER DEFAULT 5,   -- 被推荐人奖励次数
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referrer_id) REFERENCES users(id),
      FOREIGN KEY (referee_id) REFERENCES users(id)
    )`);

    // 产品配置表
    db.run(`CREATE TABLE IF NOT EXISTS product_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_type TEXT NOT NULL,  -- 产品类型
      product_code TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      description TEXT,
      original_price DECIMAL(10,2) NOT NULL,
      discount_price DECIMAL(10,2),
      usage_count INTEGER DEFAULT 0,  -- 包含使用次数
      subscription_months INTEGER DEFAULT 0,  -- 订阅月数
      features TEXT,  -- JSON格式的功能列表
      is_active BOOLEAN DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 插入默认产品配置
    const defaultProducts = [
      {
        product_type: 'usage_pack',
        product_code: 'USAGE_100',
        product_name: '入门包',
        description: '100次使用次数',
        original_price: 19.00,
        usage_count: 100,
        features: JSON.stringify(['基础功能', '历史记录'])
      },
      {
        product_type: 'usage_pack',
        product_code: 'USAGE_300',
        product_name: '进阶包',
        description: '300次使用次数',
        original_price: 49.00,
        usage_count: 300,
        features: JSON.stringify(['基础功能', '历史记录', '优先支持'])
      },
      {
        product_type: 'subscription',
        product_code: 'SUB_BASIC',
        product_name: '基础版',
        description: '每月200次使用 + 高级模板',
        original_price: 29.00,
        subscription_months: 1,
        features: JSON.stringify(['200次/月', '高级模板', '历史记录'])
      },
      {
        product_type: 'subscription',
        product_code: 'SUB_PRO',
        product_name: '专业版',
        description: '每月600次使用 + 所有功能',
        original_price: 79.00,
        subscription_months: 1,
        features: JSON.stringify(['600次/月', '所有功能', '优先支持', 'API接口'])
      }
    ];

    // 插入默认产品配置
    const productStmt = db.prepare(`
      INSERT OR IGNORE INTO product_configs
      (product_type, product_code, product_name, description, original_price, usage_count, subscription_months, features)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultProducts.forEach(product => {
      productStmt.run(
        product.product_type,
        product.product_code,
        product.product_name,
        product.description,
        product.original_price,
        product.usage_count,
        product.subscription_months,
        product.features
      );
    });
    productStmt.finalize();

    // 创建索引以提高查询性能
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_guest_id ON users(guest_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_usage_records_guest_id ON usage_records(guest_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no)');
  });

  console.log('用户系统数据库表初始化完成');
  db.close();
}

module.exports = { initUserDatabase };