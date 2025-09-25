const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { getUserDatabase } = require('../database/user-db');
const crypto = require('crypto');
const router = express.Router();

// 生成推荐码
function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// 获取用户推荐信息
router.get('/info', auth, async (req, res) => {
  try {
    const db = getUserDatabase();
    const userId = req.user.id;

    // 获取用户推荐信息
    db.get(
      `SELECT
        referral_code,
        referred_by,
        referral_rewards,
        (SELECT COUNT(*) FROM referral_records WHERE referrer_id = ?) as total_referrals,
        (SELECT COUNT(*) FROM referral_records WHERE referrer_id = ? AND reward_given = 1) as rewarded_referrals
       FROM users WHERE id = ?`,
      [userId, userId, userId],
      function(err, userInfo) {
        if (err) {
          console.error('获取推荐信息失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询失败'
          });
        }

        if (!userInfo) {
          return res.status(404).json({
            success: false,
            error: '用户不存在'
          });
        }

        // 如果没有推荐码，生成一个
        if (!userInfo.referral_code) {
          const newReferralCode = generateReferralCode();

          db.run(
            'UPDATE users SET referral_code = ? WHERE id = ?',
            [newReferralCode, userId],
            function(updateErr) {
              if (updateErr) {
                console.error('更新推荐码失败:', updateErr);
              } else {
                userInfo.referral_code = newReferralCode;
              }

              res.json({
                success: true,
                data: userInfo
              });
            }
          );
        } else {
          res.json({
            success: true,
            data: userInfo
          });
        }
      }
    );
  } catch (error) {
    console.error('获取推荐信息错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 获取推荐记录列表
router.get('/records', auth, async (req, res) => {
  try {
    const db = getUserDatabase();
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 获取推荐记录
    db.all(
      `SELECT
        rr.id,
        rr.referral_code,
        rr.reward_given,
        rr.referrer_reward,
        rr.referee_reward,
        rr.created_at,
        u.username as referee_username,
        u.email as referee_email
       FROM referral_records rr
       LEFT JOIN users u ON rr.referee_id = u.id
       WHERE rr.referrer_id = ?
       ORDER BY rr.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
      function(err, records) {
        if (err) {
          console.error('查询推荐记录失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询失败'
          });
        }

        // 获取总数
        db.get(
          'SELECT COUNT(*) as total FROM referral_records WHERE referrer_id = ?',
          [userId],
          function(countErr, countResult) {
            if (countErr) {
              console.error('查询推荐记录总数失败:', countErr);
              return res.status(500).json({
                success: false,
                error: '查询失败'
              });
            }

            res.json({
              success: true,
              data: {
                records: records,
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.total / limit)
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('获取推荐记录错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 使用推荐码（注册时调用）
router.post('/use', auth, async (req, res) => {
  try {
    const { referral_code } = req.body;
    const userId = req.user.id;

    if (!referral_code) {
      return res.status(400).json({
        success: false,
        error: '推荐码不能为空'
      });
    }

    const db = getUserDatabase();

    // 检查当前用户是否已经使用过推荐码
    db.get(
      'SELECT referred_by FROM users WHERE id = ?',
      [userId],
      function(err, userInfo) {
        if (err) {
          console.error('查询用户信息失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询失败'
          });
        }

        if (userInfo.referred_by) {
          return res.status(400).json({
            success: false,
            error: '您已经使用过推荐码了'
          });
        }

        // 查找推荐人
        db.get(
          'SELECT id, username, email FROM users WHERE referral_code = ? AND id != ?',
          [referral_code.toUpperCase(), userId],
          function(referrerErr, referrer) {
            if (referrerErr) {
              console.error('查询推荐人失败:', referrerErr);
              return res.status(500).json({
                success: false,
                error: '查询失败'
              });
            }

            if (!referrer) {
              return res.status(404).json({
                success: false,
                error: '推荐码不存在或无效'
              });
            }

            // 开始事务处理推荐奖励
            db.serialize(() => {
              db.run('BEGIN TRANSACTION');

              // 更新被推荐人信息
              db.run(
                'UPDATE users SET referred_by = ?, referral_rewards = referral_rewards + ? WHERE id = ?',
                [referral_code.toUpperCase(), 5, userId],
                function(updateErr) {
                  if (updateErr) {
                    console.error('更新被推荐人信息失败:', updateErr);
                    db.run('ROLLBACK');
                    return res.status(500).json({
                      success: false,
                      error: '处理推荐失败'
                    });
                  }

                  // 更新推荐人奖励
                  db.run(
                    'UPDATE users SET referral_rewards = referral_rewards + ? WHERE id = ?',
                    [5, referrer.id],
                    function(referrerUpdateErr) {
                      if (referrerUpdateErr) {
                        console.error('更新推荐人奖励失败:', referrerUpdateErr);
                        db.run('ROLLBACK');
                        return res.status(500).json({
                          success: false,
                          error: '处理推荐失败'
                        });
                      }

                      // 记录推荐关系
                      db.run(
                        `INSERT INTO referral_records
                         (referrer_id, referee_id, referral_code, reward_given, referrer_reward, referee_reward)
                         VALUES (?, ?, ?, 1, 5, 5)`,
                        [referrer.id, userId, referral_code.toUpperCase()],
                        function(recordErr) {
                          if (recordErr) {
                            console.error('记录推荐关系失败:', recordErr);
                            db.run('ROLLBACK');
                            return res.status(500).json({
                              success: false,
                              error: '处理推荐失败'
                            });
                          }

                          db.run('COMMIT');
                          res.json({
                            success: true,
                            message: '推荐码使用成功！您和推荐人都获得了5次免费使用机会',
                            data: {
                              referrer: {
                                username: referrer.username,
                                email: referrer.email
                              },
                              reward: 5
                            }
                          });
                        }
                      );
                    }
                  );
                }
              );
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('使用推荐码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 生成或重新生成推荐码
router.post('/generate-code', auth, async (req, res) => {
  try {
    const db = getUserDatabase();
    const userId = req.user.id;
    let attempts = 0;
    const maxAttempts = 10;

    function tryGenerateCode() {
      const newReferralCode = generateReferralCode();
      attempts++;

      db.run(
        'UPDATE users SET referral_code = ? WHERE id = ? AND (referral_code IS NULL OR referral_code = ?)',
        [newReferralCode, userId, newReferralCode],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && attempts < maxAttempts) {
              // 推荐码重复，重新生成
              return tryGenerateCode();
            }

            console.error('生成推荐码失败:', err);
            return res.status(500).json({
              success: false,
              error: '生成推荐码失败'
            });
          }

          if (this.changes === 0) {
            return res.status(400).json({
              success: false,
              error: '您已有推荐码，无需重新生成'
            });
          }

          res.json({
            success: true,
            data: {
              referral_code: newReferralCode
            }
          });
        }
      );
    }

    tryGenerateCode();
  } catch (error) {
    console.error('生成推荐码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

module.exports = router;