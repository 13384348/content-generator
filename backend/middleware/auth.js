const UserService = require('../services/userService');

// 认证中间件 - 只允许已登录用户访问
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '请先登录后再使用此功能' });
  }

  let userService = null;
  try {
    userService = new UserService();
    const decoded = userService.verifyToken(token);

    // 只允许注册用户，拒绝访客
    if (decoded.type !== 'user') {
      userService.close();
      return res.status(401).json({ error: '请先登录后再使用此功能' });
    }

    const user = await userService.getUserById(decoded.userId);
    req.user = {
      id: user.id,
      email: user.email,
      type: 'user'
    };

    userService.close();
    next();
  } catch (error) {
    if (userService) {
      userService.close();
    }
    return res.status(403).json({ error: '无效的访问令牌，请重新登录' });
  }
}

// 严格认证中间件 - 必须登录
const requireAuth = authenticateToken;

module.exports = {
  auth: authenticateToken,
  authenticateToken,
  requireAuth
};