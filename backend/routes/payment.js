const express = require('express');
const { auth } = require('../middleware/auth');
const { getUserDatabase } = require('../database/user-db');
const router = express.Router();

// 创建订单
router.post('/create-order', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId, paymentMethod, amount, count } = req.body;

    if (!packageId || !paymentMethod || !amount || !count) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const db = getUserDatabase();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建订单记录
    const orderNo = orderId;
    db.run(
      `INSERT INTO orders (order_no, user_id, product_type, product_name, original_price, final_price, payment_method, payment_status, usage_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [orderNo, userId, 'usage_pack', `使用次数包-${count}次`, amount, amount, paymentMethod, 'pending', count],
      function(err) {
        if (err) {
          console.error('创建订单失败:', err);
          return res.status(500).json({
            success: false,
            error: '创建订单失败'
          });
        }

        res.json({
          success: true,
          data: {
            orderId: orderId,
            amount: amount,
            paymentMethod: paymentMethod
          }
        });
      }
    );
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 确认支付
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: '缺少订单ID'
      });
    }

    const db = getUserDatabase();

    // 获取订单信息
    db.get(
      'SELECT * FROM orders WHERE order_no = ? AND user_id = ? AND payment_status = ?',
      [orderId, userId, 'pending'],
      function(err, order) {
        if (err) {
          console.error('查询订单失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询订单失败'
          });
        }

        if (!order) {
          return res.status(404).json({
            success: false,
            error: '订单不存在或已处理'
          });
        }

        // 更新订单状态
        db.run(
          `UPDATE orders SET payment_status = 'paid', payment_time = datetime('now') WHERE order_no = ?`,
          [orderId],
          function(updateErr) {
            if (updateErr) {
              console.error('更新订单状态失败:', updateErr);
              return res.status(500).json({
                success: false,
                error: '更新订单状态失败'
              });
            }

            // 增加用户购买的使用次数
            db.run(
              `UPDATE users SET total_purchased = total_purchased + ?, updated_at = datetime('now') WHERE id = ?`,
              [order.usage_count, userId],
              function(userUpdateErr) {
                if (userUpdateErr) {
                  console.error('更新用户使用次数失败:', userUpdateErr);
                  return res.status(500).json({
                    success: false,
                    error: '更新用户使用次数失败'
                  });
                }

                res.json({
                  success: true,
                  data: {
                    orderId: orderId,
                    usageCount: order.usage_count
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('确认支付错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 创建订阅
router.post('/create-subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, cycleId, paymentMethod, amount, monthlyUsage, features } = req.body;

    if (!planId || !cycleId || !paymentMethod || !amount || !monthlyUsage) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    const db = getUserDatabase();
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 计算订阅周期
    let endDate;
    const now = new Date();

    switch (cycleId) {
      case 'monthly':
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'quarterly':
        endDate = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'yearly':
        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        endDate = new Date(now.setMonth(now.getMonth() + 1));
    }

    // 创建订阅记录
    const subscriptionOrderNo = subscriptionId;
    db.run(
      `INSERT INTO orders (order_no, user_id, product_type, product_name, original_price, final_price, payment_method, payment_status, usage_count, subscription_months, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [subscriptionOrderNo, userId, 'subscription', `订阅服务-${planId}`, amount, amount, paymentMethod, 'pending', monthlyUsage, 1, endDate.toISOString()],
      function(err) {
        if (err) {
          console.error('创建订阅失败:', err);
          return res.status(500).json({
            success: false,
            error: '创建订阅失败'
          });
        }

        res.json({
          success: true,
          data: {
            subscriptionId: subscriptionId,
            amount: amount,
            paymentMethod: paymentMethod,
            endDate: endDate
          }
        });
      }
    );
  } catch (error) {
    console.error('创建订阅错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 确认订阅支付
router.post('/confirm-subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: '缺少订阅ID'
      });
    }

    const db = getUserDatabase();

    // 获取订阅信息
    db.get(
      'SELECT * FROM orders WHERE order_no = ? AND user_id = ? AND product_type = ? AND payment_status = ?',
      [subscriptionId, userId, 'subscription', 'pending'],
      function(err, subscription) {
        if (err) {
          console.error('查询订阅失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询订阅失败'
          });
        }

        if (!subscription) {
          return res.status(404).json({
            success: false,
            error: '订阅不存在或已处理'
          });
        }

        // 更新订阅状态
        db.run(
          `UPDATE orders SET payment_status = 'paid', payment_time = datetime('now') WHERE order_no = ?`,
          [subscriptionId],
          function(updateErr) {
            if (updateErr) {
              console.error('更新订阅状态失败:', updateErr);
              return res.status(500).json({
                success: false,
                error: '更新订阅状态失败'
              });
            }

            // 更新用户订阅状态
            db.run(
              `UPDATE users SET subscription_status = 'active',
                              subscription_type = ?,
                              subscription_start_date = datetime('now'),
                              subscription_end_date = ?,
                              monthly_usage_limit = ?,
                              monthly_usage_count = 0,
                              updated_at = datetime('now')
               WHERE id = ?`,
              [subscription.product_name, subscription.expires_at, subscription.usage_count, userId],
              function(userUpdateErr) {
                if (userUpdateErr) {
                  console.error('更新用户订阅状态失败:', userUpdateErr);
                  return res.status(500).json({
                    success: false,
                    error: '更新用户订阅状态失败'
                  });
                }

                res.json({
                  success: true,
                  data: {
                    subscriptionId: subscriptionId,
                    endDate: subscription.expires_at,
                    monthlyUsage: subscription.usage_count
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('确认订阅错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 获取用户订单历史
router.get('/orders', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getUserDatabase();

    db.all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
      function(err, orders) {
        if (err) {
          console.error('查询订单历史失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询订单历史失败'
          });
        }

        res.json({
          success: true,
          data: orders
        });
      }
    );
  } catch (error) {
    console.error('获取订单历史错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

// 取消订阅
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getUserDatabase();

    // 获取用户当前订阅
    db.get(
      'SELECT * FROM users WHERE id = ? AND subscription_status = ?',
      [userId, 'active'],
      function(err, user) {
        if (err) {
          console.error('查询用户订阅失败:', err);
          return res.status(500).json({
            success: false,
            error: '查询用户订阅失败'
          });
        }

        if (!user) {
          return res.status(404).json({
            success: false,
            error: '未找到活跃订阅'
          });
        }

        // 取消订阅（设置为到期后不续费）
        db.run(
          `UPDATE users SET subscription_status = 'cancelled' WHERE id = ?`,
          [userId],
          function(updateErr) {
            if (updateErr) {
              console.error('取消订阅失败:', updateErr);
              return res.status(500).json({
                success: false,
                error: '取消订阅失败'
              });
            }

            res.json({
              success: true,
              message: '订阅已取消，将在当前周期结束后停止'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('取消订阅错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
});

module.exports = router;