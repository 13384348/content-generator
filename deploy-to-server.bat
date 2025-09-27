@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 🚀 Windows自动化服务器部署脚本
REM 使用方法: deploy-to-server.bat

echo.
echo 🚀 开始自动化服务器部署...
echo.

REM 配置变量
set SERVER_IP=8.154.36.16
set SERVER_USER=root
set PROJECT_PATH=/opt/content-generator
set BACKUP_PATH=/opt/content-generator-backup-%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%

REM 检查必要工具
where git >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Git，请先安装Git
    pause
    exit /b 1
)

where ssh >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到SSH，请先安装OpenSSH或Git Bash
    pause
    exit /b 1
)

REM 检查项目目录
if not exist "package.json" (
    echo ❌ 请在项目根目录执行此脚本
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ 未找到frontend目录
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ 未找到backend目录
    pause
    exit /b 1
)

echo ✅ 项目目录检查通过

REM 检查服务器连接
echo.
echo 🔍 检查服务器连接...
ssh -o ConnectTimeout=10 %SERVER_USER%@%SERVER_IP% "echo 'Connected'" >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到服务器 %SERVER_IP%
    echo 请检查：
    echo   1. 网络连接是否正常
    echo   2. SSH密钥是否配置正确
    echo   3. 服务器IP地址是否正确
    pause
    exit /b 1
)
echo ✅ 服务器连接正常

REM 检查Git状态
echo.
echo 🔍 检查Git状态...
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    for /f %%i in ('git status --porcelain ^| find /c /v ""') do set changes=%%i
    if !changes! gtr 0 (
        echo ⚠️  工作目录有未提交的更改
        set /p confirm="是否继续？(y/N): "
        if /i not "!confirm!"=="y" (
            echo 部署已取消
            pause
            exit /b 1
        )
    )
)

REM 本地构建测试
echo.
echo 🔍 执行本地构建测试...
cd frontend
call npm run build >nul 2>&1
if errorlevel 1 (
    echo ❌ 前端构建失败，请修复后重试
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ 本地构建测试通过

REM 提交并推送代码
echo.
echo 📤 提交并推送代码...
git add .
git diff --cached --name-only >nul 2>&1
if not errorlevel 1 (
    git commit -m "🚀 部署更新 - %date% %time%"
    git push origin main
    if errorlevel 1 (
        echo ❌ 代码推送失败
        pause
        exit /b 1
    )
    echo ✅ 代码已推送到远程仓库
) else (
    echo ℹ️  没有新的更改需要提交
)

REM 服务器部署
echo.
echo 🚀 开始服务器部署...

REM 停止旧服务
echo   ⏹️  停止旧服务...
ssh %SERVER_USER%@%SERVER_IP% "pkill -f 'node.*server.js' || true"

REM 备份旧代码
echo   📦 备份旧代码...
ssh %SERVER_USER%@%SERVER_IP% "if [ -d '%PROJECT_PATH%' ]; then mv '%PROJECT_PATH%' '%BACKUP_PATH%'; echo '已备份旧代码'; fi"

REM 克隆最新代码
echo   📥 克隆最新代码...
ssh %SERVER_USER%@%SERVER_IP% "mkdir -p '%PROJECT_PATH%' && cd '%PROJECT_PATH%' && git clone https://github.com/13384348/content-generator.git ."
if errorlevel 1 (
    echo ❌ 代码克隆失败
    pause
    exit /b 1
)

REM 安装后端依赖
echo   📦 安装后端依赖...
ssh %SERVER_USER%@%SERVER_IP% "cd '%PROJECT_PATH%/backend' && npm install --production"
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

REM 构建前端
echo   🏗️  构建前端...
ssh %SERVER_USER%@%SERVER_IP% "cd '%PROJECT_PATH%/frontend' && npm install && npm run build"
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

REM 配置生产环境
echo   ⚙️  配置生产环境...
ssh %SERVER_USER%@%SERVER_IP% "cd '%PROJECT_PATH%/backend' && cat > .env << 'EOF'
NODE_ENV=production
PORT=5004
APP_NAME=ContentGenerator

# AI服务配置
DEEPSEEK_API_KEY=sk-7d1faa1d671a4ba3b20a07758c930e42
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# JWT配置
JWT_SECRET=content_generator_jwt_secret_2025
JWT_EXPIRES_IN=7d

# 管理员配置
ADMIN_PASSWORD=admin123

# 监控配置
LOG_LEVEL=info

# CORS配置
CORS_ORIGIN=http://8.154.36.16
EOF"

REM 启动服务
echo   🚀 启动服务...
ssh %SERVER_USER%@%SERVER_IP% "cd '%PROJECT_PATH%/backend' && nohup node server.js > app.log 2>&1 &"

REM 等待服务启动
echo   ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

REM 部署后验证
echo.
echo 🔍 执行部署后验证...

REM 健康检查
ssh %SERVER_USER%@%SERVER_IP% "curl -f http://localhost:5004/api/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ 健康检查失败
    echo 查看日志: ssh %SERVER_USER%@%SERVER_IP% 'tail -20 %PROJECT_PATH%/backend/app.log'
    pause
    exit /b 1
)
echo ✅ 健康检查通过

REM 前端页面检查
curl -f http://%SERVER_IP%:5004/ >nul 2>&1
if errorlevel 1 (
    echo ⚠️  前端页面访问可能有问题
) else (
    echo ✅ 前端页面访问正常
)

REM 显示部署结果
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ 🎉 部署完成！
echo.
echo 📊 部署信息:
echo   🌐 网站地址: http://%SERVER_IP%:5004
echo   📁 部署路径: %PROJECT_PATH%
echo   📦 备份路径: %BACKUP_PATH%
echo   ⏰ 部署时间: %date% %time%
echo.
echo 🔍 快速检查命令:
echo   服务状态: ssh %SERVER_USER%@%SERVER_IP% "ps aux | grep node"
echo   查看日志: ssh %SERVER_USER%@%SERVER_IP% "tail -f %PROJECT_PATH%/backend/app.log"
echo   重启服务: ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_PATH%/backend && pkill -f node && nohup node server.js > app.log 2>&1 &"
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✨ 所有部署步骤已完成！
echo.
pause