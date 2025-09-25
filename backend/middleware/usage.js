const UsageService = require('../services/usageService');

// 使用次数检查中间件
async function checkUsageLimit(req, res, next) {
  try {
    const usageService = new UsageService();
    const userId = req.user?.type === 'user' ? req.user.id : null;
    const guestId = req.user?.type === 'guest' ? req.user.guestId : null;

    // 检查是否可以使用功能
    const usageInfo = await usageService.canUseFeature(userId, guestId);
    usageService.close();

    if (!usageInfo.canUse) {
      let message = '';
      if (usageInfo.type === 'guest') {
        message = `访客用户每日限制${usageInfo.limit}次，您已使用${usageInfo.usageCount}次。请注册账户获得更多使用次数。`;
      } else {
        if (usageInfo.freeRemaining === 0 && usageInfo.paidRemaining === 0 && usageInfo.monthlyRemaining === 0) {
          message = '您的使用次数已用完。请购买使用次数或订阅服务。';
        } else {
          message = `使用次数不足。免费剩余：${usageInfo.freeRemaining}次，付费剩余：${usageInfo.paidRemaining}次`;
        }
      }

      return res.status(402).json({
        success: false,
        error: message,
        usageInfo: {
          canUse: false,
          ...usageInfo
        }
      });
    }

    // 将使用信息添加到请求对象中
    req.usageInfo = usageInfo;
    next();
  } catch (error) {
    console.error('检查使用限制失败:', error);
    res.status(500).json({
      success: false,
      error: '检查使用限制失败'
    });
  }
}

// 记录使用次数中间件（在API调用成功后使用）
async function recordUsageAfterSuccess(featureType, contentType = null) {
  return async (req, res, next) => {
    // 保存原始的json方法
    const originalJson = res.json;

    // 重写json方法来拦截响应
    res.json = async function(data) {
      try {
        // 只在成功响应时记录使用次数
        if (data && data.success) {
          const usageService = new UsageService();
          const userId = req.user?.type === 'user' ? req.user.id : null;
          const guestId = req.user?.type === 'guest' ? req.user.guestId : null;

          // 确定使用类型
          let usageType = 'free';
          if (req.usageInfo) {
            if (req.usageInfo.freeRemaining > 0) {
              usageType = 'free';
            } else if (req.usageInfo.paidRemaining > 0) {
              usageType = 'paid';
            } else if (req.usageInfo.monthlyRemaining > 0) {
              usageType = 'subscription';
            }
          }

          // 记录使用记录
          await usageService.recordUsage(
            userId,
            guestId,
            featureType,
            contentType,
            JSON.stringify(req.body),
            JSON.stringify(data),
            usageType
          );

          // 增加使用次数
          if (usageType === 'subscription') {
            // 订阅用户增加月度使用次数
            await usageService.db.run(
              'UPDATE users SET monthly_usage_count = monthly_usage_count + 1 WHERE id = ?',
              [userId]
            );
          } else {
            await usageService.incrementUsage(userId, guestId, usageType);
          }

          usageService.close();
        }
      } catch (error) {
        console.error('记录使用次数失败:', error);
        // 不阻止正常响应，但记录错误
      }

      // 调用原始的json方法
      originalJson.call(this, data);
    };

    next();
  };
}

// 提供当前使用状态的中间件
async function addUsageInfo(req, res, next) {
  try {
    if (req.user) {
      const usageService = new UsageService();
      const userId = req.user?.type === 'user' ? req.user.id : null;
      const guestId = req.user?.type === 'guest' ? req.user.guestId : null;

      const usageInfo = await usageService.canUseFeature(userId, guestId);
      req.usageInfo = usageInfo;
      usageService.close();
    }
    next();
  } catch (error) {
    console.error('获取使用信息失败:', error);
    next(); // 继续执行，不阻止请求
  }
}

module.exports = {
  checkUsageLimit,
  recordUsageAfterSuccess,
  addUsageInfo
};