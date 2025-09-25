const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'content_generator.db');

class UsageService {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  // 记录使用次数
  async recordUsage(userId, guestId, featureType, contentType, inputData, outputData, usageType = 'free') {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO usage_records
        (user_id, guest_id, feature_type, content_type, input_data, output_data, usage_type, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userId || null,
        guestId || null,
        featureType,
        contentType || null,
        inputData,
        outputData,
        usageType,
        null, // IP地址可以从请求中获取
        null  // User-Agent可以从请求中获取
      , function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
      stmt.finalize();
    });
  }

  // 增加用户使用次数
  async incrementUsage(userId, guestId, usageType = 'free') {
    return new Promise((resolve, reject) => {
      let sql, params;

      if (guestId) {
        // 访客用户
        sql = 'UPDATE users SET free_usage_count = free_usage_count + 1 WHERE guest_id = ?';
        params = [guestId];
      } else {
        // 注册用户
        if (usageType === 'free') {
          sql = 'UPDATE users SET free_usage_count = free_usage_count + 1 WHERE id = ?';
        } else {
          sql = 'UPDATE users SET paid_usage_count = paid_usage_count + 1 WHERE id = ?';
        }
        params = [userId];
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // 检查用户是否可以使用功能
  async canUseFeature(userId, guestId) {
    return new Promise((resolve, reject) => {
      if (guestId) {
        // 访客用户检查
        this.db.get(
          'SELECT free_usage_count FROM users WHERE guest_id = ?',
          [guestId],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              const usageCount = row ? row.free_usage_count : 0;
              const limit = 5; // 访客限制5次
              resolve({
                canUse: usageCount < limit,
                usageCount,
                limit,
                remaining: Math.max(0, limit - usageCount),
                type: 'guest'
              });
            }
          }
        );
      } else {
        // 注册用户检查
        this.db.get(`
          SELECT
            free_usage_count,
            paid_usage_count,
            total_purchased,
            subscription_status,
            subscription_end_date,
            monthly_usage_limit,
            monthly_usage_count,
            last_usage_reset_date
          FROM users
          WHERE id = ?
        `, [userId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (!row) {
              return reject(new Error('用户不存在'));
            }

            const freeLimit = 10; // 注册用户免费10次
            const freeRemaining = Math.max(0, freeLimit - row.free_usage_count);
            const paidRemaining = Math.max(0, row.total_purchased - row.paid_usage_count);

            // 检查订阅状态
            let subscriptionActive = false;
            let monthlyRemaining = 0;

            if (row.subscription_status === 'active' &&
                new Date(row.subscription_end_date) > new Date()) {
              subscriptionActive = true;

              // 检查是否需要重置月度使用量
              const now = new Date();
              const lastReset = new Date(row.last_usage_reset_date || 0);
              const shouldReset = now.getMonth() !== lastReset.getMonth() ||
                                 now.getFullYear() !== lastReset.getFullYear();

              if (shouldReset) {
                // 重置月度使用量
                this.resetMonthlyUsage(userId);
                monthlyRemaining = row.monthly_usage_limit;
              } else {
                monthlyRemaining = Math.max(0, row.monthly_usage_limit - row.monthly_usage_count);
              }
            }

            const canUse = freeRemaining > 0 || paidRemaining > 0 || monthlyRemaining > 0;

            resolve({
              canUse,
              freeUsageCount: row.free_usage_count,
              freeLimit,
              freeRemaining,
              paidUsageCount: row.paid_usage_count,
              totalPurchased: row.total_purchased,
              paidRemaining,
              subscriptionActive,
              monthlyUsageCount: row.monthly_usage_count,
              monthlyUsageLimit: row.monthly_usage_limit,
              monthlyRemaining,
              type: 'user'
            });
          }
        });
      }
    });
  }

  // 重置月度使用量
  async resetMonthlyUsage(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE users
        SET monthly_usage_count = 0, last_usage_reset_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // 获取用户使用历史
  async getUserUsageHistory(userId, guestId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT
          feature_type,
          content_type,
          input_data,
          output_data,
          usage_type,
          created_at
        FROM usage_records
        WHERE ${userId ? 'user_id = ?' : 'guest_id = ?'}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const params = [userId || guestId, limit, offset];

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 获取使用统计
  async getUsageStats(userId, guestId) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT
          feature_type,
          COUNT(*) as count,
          MAX(created_at) as last_used
        FROM usage_records
        WHERE ${userId ? 'user_id = ?' : 'guest_id = ?'}
        GROUP BY feature_type
        ORDER BY count DESC
      `;

      this.db.all(sql, [userId || guestId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 增加用户购买的次数
  async addPurchasedUsage(userId, amount) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET total_purchased = total_purchased + ? WHERE id = ?',
        [amount, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  // 更新用户订阅状态
  async updateSubscription(userId, subscriptionType, months, monthlyLimit) {
    return new Promise((resolve, reject) => {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      this.db.run(`
        UPDATE users
        SET
          subscription_type = ?,
          subscription_status = 'active',
          subscription_end_date = ?,
          monthly_usage_limit = ?,
          monthly_usage_count = 0,
          last_usage_reset_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [subscriptionType, endDate.toISOString(), monthlyLimit, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = UsageService;