const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'content_generator.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class UserService {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  // 生成访客ID和token
  async createGuest() {
    const guestId = uuidv4();
    const token = jwt.sign(
      { guestId, type: 'guest' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (guest_id, is_guest, free_usage_count)
        VALUES (?, ?, ?)
      `);

      stmt.run(guestId, 1, 0, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            guestId,
            token,
            userId: this.lastID,
            freeUsageLimit: 5,
            freeUsageCount: 0
          });
        }
      });
      stmt.finalize();
    });
  }

  // 用户注册
  async register(email, password, referralCode = null) {
    return new Promise(async (resolve, reject) => {
      try {
        // 检查邮箱是否已存在
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
          return reject(new Error('邮箱已被注册'));
        }

        // 加密密码
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 生成推荐码
        const userReferralCode = this.generateReferralCode();

        // 处理推荐关系
        let referrerId = null;
        if (referralCode) {
          const referrer = await this.getUserByReferralCode(referralCode);
          if (referrer) {
            referrerId = referrer.id;
          }
        }

        const stmt = this.db.prepare(`
          INSERT INTO users (
            email, password_hash, is_registered, registration_bonus_used,
            referral_code, referred_by, free_usage_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          email, passwordHash, 1, 0,
          userReferralCode, referrerId, 0,
          async function(err) {
            if (err) {
              reject(err);
            } else {
              const userId = this.lastID;

              // 如果有推荐人，创建推荐记录
              if (referrerId) {
                await this.createReferralRecord(referrerId, userId, referralCode);
              }

              const token = jwt.sign(
                { userId, email, type: 'user' },
                JWT_SECRET,
                { expiresIn: '30d' }
              );

              resolve({
                userId,
                email,
                token,
                referralCode: userReferralCode,
                freeUsageLimit: 10, // 注册用户10次免费
                freeUsageCount: 0
              });
            }
          }
        );
        stmt.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 用户登录
  async login(email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.getUserByEmail(email);
        if (!user) {
          return reject(new Error('用户不存在'));
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return reject(new Error('密码错误'));
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, type: 'user' },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        // 更新最后登录时间
        this.db.run(
          'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );

        resolve({
          userId: user.id,
          email: user.email,
          token,
          referralCode: user.referral_code,
          freeUsageLimit: 10,
          freeUsageCount: user.free_usage_count,
          paidUsageCount: user.paid_usage_count,
          subscriptionStatus: user.subscription_status
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // 验证token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('无效的token');
    }
  }

  // 获取用户信息
  async getUserById(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 通过邮箱获取用户
  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 通过推荐码获取用户
  async getUserByReferralCode(referralCode) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE referral_code = ?',
        [referralCode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 通过访客ID获取用户
  async getUserByGuestId(guestId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE guest_id = ?',
        [guestId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 检查用户使用次数
  async checkUsageLimit(userId, guestId = null) {
    return new Promise((resolve, reject) => {
      if (guestId) {
        // 访客用户
        this.db.get(
          'SELECT free_usage_count FROM users WHERE guest_id = ?',
          [guestId],
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              const usageCount = row ? row.free_usage_count : 0;
              resolve({
                canUse: usageCount < 5, // 访客5次限制
                usageCount,
                limit: 5,
                type: 'guest'
              });
            }
          }
        );
      } else {
        // 注册用户
        this.db.get(`
          SELECT
            free_usage_count,
            paid_usage_count,
            total_purchased,
            subscription_status,
            monthly_usage_limit,
            monthly_usage_count
          FROM users WHERE id = ?
        `, [userId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (!row) {
              return reject(new Error('用户不存在'));
            }

            const freeLimit = 10;
            const totalUsable = freeLimit + (row.total_purchased - row.paid_usage_count);
            const canUse = row.free_usage_count < freeLimit ||
                          row.paid_usage_count < row.total_purchased ||
                          (row.subscription_status === 'active' &&
                           row.monthly_usage_count < row.monthly_usage_limit);

            resolve({
              canUse,
              freeUsageCount: row.free_usage_count,
              paidUsageCount: row.paid_usage_count,
              totalPurchased: row.total_purchased,
              freeLimit,
              subscriptionStatus: row.subscription_status,
              monthlyUsageLimit: row.monthly_usage_limit,
              monthlyUsageCount: row.monthly_usage_count,
              type: 'user'
            });
          }
        });
      }
    });
  }

  // 生成推荐码
  generateReferralCode() {
    return 'REF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  }

  // 创建推荐记录
  async createReferralRecord(referrerId, refereeId, referralCode) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO referral_records (referrer_id, referee_id, referral_code)
        VALUES (?, ?, ?)
      `);

      stmt.run(referrerId, refereeId, referralCode, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
      stmt.finalize();
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = UserService;