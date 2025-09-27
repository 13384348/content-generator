@echo off
echo 测试部署脚本
echo.

echo 1. 检查当前目录...
echo 当前目录: %CD%
echo.

echo 2. 检查文件存在...
if exist "package.json" (
    echo ✅ package.json 存在
) else (
    echo ❌ package.json 不存在
)

if exist "frontend" (
    echo ✅ frontend 目录存在
) else (
    echo ❌ frontend 目录不存在
)

if exist "backend" (
    echo ✅ backend 目录存在
) else (
    echo ❌ backend 目录不存在
)
echo.

echo 3. 检查SSH...
where ssh >nul 2>&1
if errorlevel 1 (
    echo ❌ SSH 未找到
    echo 请确保安装了Git或OpenSSH
) else (
    echo ✅ SSH 可用
    echo.
    echo 4. 测试服务器连接...
    ssh -o ConnectTimeout=5 root@8.154.36.16 "echo 'SSH连接成功'" 2>nul
    if errorlevel 1 (
        echo ❌ 无法连接到服务器 8.154.36.16
        echo 可能的原因：
        echo   - 网络问题
        echo   - SSH密钥未配置
        echo   - 服务器不可达
    ) else (
        echo ✅ 服务器连接正常
    )
)

echo.
echo 测试完成！
echo.
pause