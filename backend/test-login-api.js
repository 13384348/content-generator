const UserService = require('./services/userService');

async function testLogin() {
    const userService = new UserService();

    console.log('测试管理员登录...');

    try {
        // 测试管理员账号登录
        const result = await userService.login('ok47584@126.com', '112233');
        console.log('登录成功:', result);
    } catch (error) {
        console.error('登录失败:', error.message);

        // 检查用户是否存在
        try {
            const user = await userService.getUserByEmail('ok47584@126.com');
            if (user) {
                console.log('用户存在，密码可能不正确');
                console.log('用户信息:', {
                    id: user.id,
                    email: user.email,
                    hasPassword: !!user.password_hash
                });
            } else {
                console.log('用户不存在');
            }
        } catch (userError) {
            console.error('查询用户失败:', userError.message);
        }
    }

    userService.close();
}

testLogin();