-- 内容生成器数据库初始化脚本
-- PostgreSQL版本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    referral_code VARCHAR(8) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    referral_rewards INTEGER DEFAULT 0,
    free_usage_count INTEGER DEFAULT 0,
    free_usage_limit INTEGER DEFAULT 5,
    paid_usage_count INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0
);

-- 创建访客用户表
CREATE TABLE IF NOT EXISTS guest_users (
    id SERIAL PRIMARY KEY,
    guest_id VARCHAR(36) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    free_usage_count INTEGER DEFAULT 0,
    free_usage_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建内容历史表
CREATE TABLE IF NOT EXISTS content_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    guest_id VARCHAR(36) REFERENCES guest_users(guest_id),
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建推荐记录表
CREATE TABLE IF NOT EXISTS referral_records (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referee_id INTEGER NOT NULL REFERENCES users(id),
    referral_code VARCHAR(8) NOT NULL,
    referrer_reward INTEGER DEFAULT 5,
    referee_reward INTEGER DEFAULT 5,
    reward_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建支付记录表
CREATE TABLE IF NOT EXISTS payment_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method VARCHAR(50),
    stripe_payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    usage_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_guest_users_guest_id ON guest_users(guest_id);
CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON content_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_history_guest_id ON content_history(guest_id);
CREATE INDEX IF NOT EXISTS idx_content_history_created_at ON content_history(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_records_referrer_id ON referral_records(referrer_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_history_updated_at
    BEFORE UPDATE ON content_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始管理员用户（可选）
-- INSERT INTO users (email, password_hash, username, free_usage_limit, is_active)
-- VALUES ('admin@example.com', '$2b$10$...', 'admin', 1000, true)
-- ON CONFLICT (email) DO NOTHING;