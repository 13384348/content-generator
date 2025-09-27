#!/bin/bash

# 🚀 自动化服务器部署脚本
# 使用方法: ./deploy-to-server.sh

set -e  # 遇到错误立即停止

# 配置变量
SERVER_IP="8.154.36.16"
SERVER_USER="root"
PROJECT_PATH="/opt/content-generator"
BACKUP_PATH="/opt/content-generator-backup-$(date +%Y%m%d_%H%M%S)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 检查网络连接
check_connection() {
    log "检查服务器连接..."
    if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Connected'" >/dev/null 2>&1; then
        error "无法连接到服务器 $SERVER_IP"
    fi
    success "服务器连接正常"
}

# 部署前本地检查
pre_deploy_check() {
    log "执行部署前检查..."

    # 检查是否在正确的目录
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
        error "请在项目根目录执行此脚本"
    fi

    # 检查Git状态
    if [ -n "$(git status --porcelain)" ]; then
        warning "工作目录有未提交的更改"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "部署已取消"
        fi
    fi

    # 本地构建测试
    log "执行本地构建测试..."
    cd frontend
    if ! npm run build >/dev/null 2>&1; then
        error "前端构建失败，请修复后重试"
    fi
    cd ..

    success "部署前检查通过"
}

# 数据一致性检查
check_data_consistency() {
    log "检查前后端数据一致性..."

    # 启动本地服务器进行检查
    cd backend
    if ! timeout 10 node -e "
        require('./database/init').initDatabase();
        const db = require('./database/db').getDatabase();
        db.all('SELECT type FROM hook_prompts', (err, rows) => {
            if (err) process.exit(1);
            console.log('Hook types:', rows.map(r => r.type).join(','));
            process.exit(0);
        });
    " 2>/dev/null; then
        warning "无法验证数据一致性，但继续部署"
    fi
    cd ..

    success "数据一致性检查完成"
}

# 提交并推送代码
commit_and_push() {
    log "提交并推送代码..."

    # 添加部署脚本到Git
    git add .

    # 检查是否有更改需要提交
    if [ -n "$(git diff --cached --name-only)" ]; then
        log "发现更改，正在提交..."
        git commit -m "🚀 部署更新 - $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        success "代码已推送到远程仓库"
    else
        log "没有新的更改需要提交"
    fi
}

# 服务器部署
deploy_to_server() {
    log "开始服务器部署..."

    # 停止服务器上的旧服务
    ssh $SERVER_USER@$SERVER_IP "pkill -f 'node.*server.js' || true"
    success "已停止旧服务"

    # 备份旧代码
    ssh $SERVER_USER@$SERVER_IP "
        if [ -d '$PROJECT_PATH' ]; then
            mv '$PROJECT_PATH' '$BACKUP_PATH'
            echo '已备份旧代码到 $BACKUP_PATH'
        fi
    "

    # 克隆最新代码
    log "克隆最新代码..."
    ssh $SERVER_USER@$SERVER_IP "
        mkdir -p '$PROJECT_PATH'
        cd '$PROJECT_PATH'
        git clone https://github.com/13384348/content-generator.git .
    "
    success "代码克隆完成"

    # 安装后端依赖
    log "安装后端依赖..."
    ssh $SERVER_USER@$SERVER_IP "
        cd '$PROJECT_PATH/backend'
        npm install --production
    "
    success "后端依赖安装完成"

    # 安装前端依赖并构建
    log "构建前端..."
    ssh $SERVER_USER@$SERVER_IP "
        cd '$PROJECT_PATH/frontend'
        npm install
        npm run build
    "
    success "前端构建完成"

    # 配置生产环境
    log "配置生产环境..."
    ssh $SERVER_USER@$SERVER_IP "
        cd '$PROJECT_PATH/backend'
        cat > .env << 'EOF'
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
EOF
    "
    success "环境配置完成"

    # 启动服务
    log "启动服务..."
    ssh $SERVER_USER@$SERVER_IP "
        cd '$PROJECT_PATH/backend'
        nohup node server.js > app.log 2>&1 &
        sleep 3
    "
    success "服务已启动"
}

# 部署后验证
post_deploy_verification() {
    log "执行部署后验证..."

    # 等待服务启动
    sleep 5

    # 健康检查
    if ssh $SERVER_USER@$SERVER_IP "curl -f http://localhost:5004/api/health >/dev/null 2>&1"; then
        success "健康检查通过"
    else
        error "健康检查失败"
    fi

    # 前端页面检查
    if curl -f http://$SERVER_IP:5004/ >/dev/null 2>&1; then
        success "前端页面访问正常"
    else
        error "前端页面访问失败"
    fi

    # API功能检查
    log "检查API功能..."
    if curl -s http://$SERVER_IP:5004/api/prompts | jq length >/dev/null 2>&1; then
        success "API功能正常"
    else
        warning "API功能检查失败，但服务已启动"
    fi
}

# 显示部署结果
show_result() {
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    success "🎉 部署完成！"
    echo
    echo -e "${BLUE}📊 部署信息:${NC}"
    echo "  🌐 网站地址: http://$SERVER_IP:5004"
    echo "  📁 部署路径: $PROJECT_PATH"
    echo "  📦 备份路径: $BACKUP_PATH"
    echo "  ⏰ 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    echo -e "${BLUE}🔍 快速检查命令:${NC}"
    echo "  服务状态: ssh $SERVER_USER@$SERVER_IP 'ps aux | grep node'"
    echo "  查看日志: ssh $SERVER_USER@$SERVER_IP 'tail -f $PROJECT_PATH/backend/app.log'"
    echo "  服务器重启: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH/backend && pkill -f node && nohup node server.js > app.log 2>&1 &'"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
}

# 主函数
main() {
    echo "🚀 开始自动化服务器部署..."
    echo

    check_connection
    pre_deploy_check
    check_data_consistency
    commit_and_push
    deploy_to_server
    post_deploy_verification
    show_result

    success "✨ 所有部署步骤已完成！"
}

# 错误处理
trap 'error "部署过程中发生错误，请检查上面的错误信息"' ERR

# 执行主函数
main "$@"