const UserService = require('../services/userService');

// 认证中间件
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '缺少访问令牌' });
  }

  try {
    const userService = new UserService();
    const decoded = userService.verifyToken(token);

    if (decoded.type === 'guest') {
      // 访客用户
      const user = await userService.getUserByGuestId(decoded.guestId);
      req.user = {
        id: user?.id,
        guestId: decoded.guestId,
        type: 'guest'
      };
    } else {
      // 注册用户
      const user = await userService.getUserById(decoded.userId);
      req.user = {
        id: user.id,
        email: user.email,
        type: 'user'
      };
    }

    userService.close();
    next();
  } catch (error) {
    userService?.close();
    return res.status(403).json({ error: '无效的访问令牌' });
  }
}

// 可选认证中间件（支持访客访问）
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const userService = new UserService();
    const decoded = userService.verifyToken(token);

    if (decoded.type === 'guest') {
      const user = await userService.getUserByGuestId(decoded.guestId);
      req.user = {
        id: user?.id,
        guestId: decoded.guestId,
        type: 'guest'
      };
    } else {
      const user = await userService.getUserById(decoded.userId);
      req.user = {
        id: user.id,
        email: user.email,
        type: 'user'
      };
    }

    userService.close();
    next();
  } catch (error) {
    userService?.close();
    req.user = null;
    next();
  }
}

module.exports = {
  auth: authenticateToken,
  authenticateToken,
  optionalAuth
};