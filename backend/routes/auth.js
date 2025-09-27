const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { authenticateToken } = require('../middleware/auth');


// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;

    // 基本验证
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '邮箱格式不正确'
      });
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少6位'
      });
    }

    const userService = new UserService();
    const userData = await userService.register(email, password, referralCode);
    userService.close();

    res.json({
      success: true,
      data: userData,
      message: '注册成功'
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(400).json({
      success: false,
      error: error.message || '注册失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
    }

    const userService = new UserService();
    const userData = await userService.login(email, password);
    userService.close();

    res.json({
      success: true,
      data: userData,
      message: '登录成功'
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(400).json({
      success: false,
      error: error.message || '登录失败'
    });
  }
});

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userService = new UserService();
    const userData = await userService.getUserById(req.user.id);

    const responseData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      type: 'user',
      referralCode: userData.referral_code,
      freeUsageCount: userData.free_usage_count,
      freeUsageLimit: 10,
      paidUsageCount: userData.paid_usage_count,
      totalPurchased: userData.total_purchased,
      subscriptionStatus: userData.subscription_status
    };

    userService.close();

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 检查使用次数限制
router.get('/usage-limit', authenticateToken, async (req, res) => {
  try {
    const userService = new UserService();
    const usageData = await userService.checkUsageLimit(req.user.id, null);
    userService.close();

    res.json({
      success: true,
      data: usageData
    });
  } catch (error) {
    console.error('检查使用限制失败:', error);
    res.status(500).json({
      success: false,
      error: '检查使用限制失败'
    });
  }
});

// 验证推荐码
router.post('/validate-referral', async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: '推荐码不能为空'
      });
    }

    const userService = new UserService();
    const referrer = await userService.getUserByReferralCode(referralCode);
    userService.close();

    if (referrer) {
      res.json({
        success: true,
        data: {
          valid: true,
          referrerEmail: referrer.email?.replace(/(.{2}).*(@.*)/, '$1***$2')
        },
        message: '推荐码有效'
      });
    } else {
      res.json({
        success: true,
        data: { valid: false },
        message: '推荐码无效'
      });
    }
  } catch (error) {
    console.error('验证推荐码失败:', error);
    res.status(500).json({
      success: false,
      error: '验证推荐码失败'
    });
  }
});

module.exports = router;